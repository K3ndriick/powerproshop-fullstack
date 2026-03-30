-- ============================================================
-- Phase 10: Inventory Management
-- Run in Supabase SQL editor (all at once)
-- ============================================================


-- ------------------------------------------------------------
-- 1. stock_adjustments
--    Append-only audit log. Every stock movement writes a row.
--    Never updated, never deleted.
-- ------------------------------------------------------------

CREATE TABLE stock_adjustments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  adjustment_type   TEXT        NOT NULL CHECK (adjustment_type IN ('sale', 'restock', 'return', 'adjustment')),
  quantity_change   INTEGER     NOT NULL,           -- positive = increase, negative = decrease
  previous_quantity INTEGER     NOT NULL,           -- snapshot before change
  new_quantity      INTEGER     NOT NULL,           -- snapshot after change
  reason            TEXT,
  created_by        UUID        REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
-- No policies: service role (admin client) bypasses RLS entirely.
-- All other access is blocked by default.


-- ------------------------------------------------------------
-- 2. stock_reservations
--    Holds stock for a user who has started checkout.
--    Rows are never directly deleted - they expire via expires_at.
--    The reserve_stock RPC ignores rows where expires_at < NOW().
-- ------------------------------------------------------------

CREATE TABLE stock_reservations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER     NOT NULL CHECK (quantity > 0),
  reserved_by UUID        NOT NULL REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
-- No direct table access. All interaction goes through the reserve_stock RPC
-- which is SECURITY DEFINER and handles its own access control.


-- ------------------------------------------------------------
-- 3. suppliers
-- ------------------------------------------------------------

CREATE TABLE suppliers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  contact_name TEXT,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  notes        TEXT,
  active       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 4. purchase_orders
-- ------------------------------------------------------------

CREATE TABLE purchase_orders (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id       UUID           REFERENCES suppliers(id),
  order_number      TEXT           UNIQUE NOT NULL,
  status            TEXT           NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
  total_cost        DECIMAL(10, 2),
  expected_delivery DATE,
  notes             TEXT,
  created_by        UUID           REFERENCES auth.users(id),
  received_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    DEFAULT NOW()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 5. purchase_order_items
--    Line items for each PO. Cascade-deleted when the PO is deleted.
-- ------------------------------------------------------------

CREATE TABLE purchase_order_items (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id   UUID           NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id          UUID           NOT NULL REFERENCES products(id),
  quantity            INTEGER        NOT NULL CHECK (quantity > 0),
  cost_per_unit       DECIMAL(10, 2) NOT NULL,
  created_at          TIMESTAMPTZ    DEFAULT NOW()
);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 6. reserve_stock RPC
--
--    Atomically checks available stock and inserts a reservation
--    if stock is sufficient. Raises an exception if not.
--
--    "Available" = stock_quantity - SUM(active reservations)
--    "Active" = expires_at > NOW()
--
--    SECURITY DEFINER: runs as the function owner (postgres), so it
--    can write to stock_reservations even though the table has no
--    public RLS policies. This is the correct pattern when you want
--    to expose a controlled write path without opening the table directly.
--
--    FOR UPDATE on the products row is the concurrency control:
--    two simultaneous calls will queue behind the lock rather than
--    both reading the same available count and both succeeding.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION reserve_stock(
  p_product_id       UUID,
  p_quantity         INTEGER,
  p_user_id          UUID,
  p_duration_minutes INTEGER DEFAULT 15
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock          INTEGER;
  v_reserved       INTEGER;
  v_available      INTEGER;
  v_reservation_id UUID;
BEGIN
  -- Lock the product row for the duration of this transaction.
  -- Any concurrent call to reserve_stock for the same product will wait here.
  SELECT stock_quantity INTO v_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found: %', p_product_id;
  END IF;

  -- Sum quantities of all non-expired reservations for this product.
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
  FROM stock_reservations
  WHERE product_id = p_product_id
    AND expires_at > NOW();

  v_available := v_stock - v_reserved;

  IF v_available < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock: % available, % requested', v_available, p_quantity;
  END IF;

  -- Insert the reservation row and return its ID to the caller.
  -- The caller stores this ID so it can be confirmed or released later.
  INSERT INTO stock_reservations (product_id, quantity, reserved_by, expires_at)
  VALUES (
    p_product_id,
    p_quantity,
    p_user_id,
    NOW() + (p_duration_minutes || ' minutes')::INTERVAL
  )
  RETURNING id INTO v_reservation_id;

  RETURN v_reservation_id;
END;
$$;


-- ------------------------------------------------------------
-- 7. receive_purchase_order RPC
--
--    Marks a PO as received, writes a stock_adjustment row for
--    each line item, and increments products.stock_quantity.
--    Runs as a single transaction - all line items succeed or none do.
--
--    Called from the admin server action when an admin clicks
--    "Mark as Received" on a PO.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION receive_purchase_order(
  p_purchase_order_id UUID,
  p_admin_user_id     UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item         RECORD;
  v_previous_qty INTEGER;
BEGIN
  -- Guard: PO must exist and be in a receivable state
  IF NOT EXISTS (
    SELECT 1 FROM purchase_orders
    WHERE id = p_purchase_order_id
      AND status IN ('pending', 'ordered')
  ) THEN
    RAISE EXCEPTION 'Purchase order not found or already received/cancelled';
  END IF;

  -- Process each line item
  FOR v_item IN
    SELECT product_id, quantity
    FROM purchase_order_items
    WHERE purchase_order_id = p_purchase_order_id
  LOOP
    -- Lock this product row before reading its quantity
    SELECT stock_quantity INTO v_previous_qty
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;

    -- Audit row
    INSERT INTO stock_adjustments (
      product_id,
      adjustment_type,
      quantity_change,
      previous_quantity,
      new_quantity,
      reason,
      created_by
    ) VALUES (
      v_item.product_id,
      'restock',
      v_item.quantity,
      v_previous_qty,
      v_previous_qty + v_item.quantity,
      'Purchase order received: ' || p_purchase_order_id,
      p_admin_user_id
    );

    -- Increment stock
    UPDATE products
    SET
      stock_quantity = stock_quantity + v_item.quantity,
      in_stock       = true,
      updated_at     = NOW()
    WHERE id = v_item.product_id;

  END LOOP;

  -- Mark PO as received
  UPDATE purchase_orders
  SET
    status      = 'received',
    received_at = NOW(),
    updated_at  = NOW()
  WHERE id = p_purchase_order_id;

END;
$$;
