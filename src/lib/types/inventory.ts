// ============================================================
// STOCK ADJUSTMENT TYPES
// ============================================================

export type AdjustmentType = 'sale' | 'restock' | 'return' | 'adjustment'

export type StockAdjustment = {
  id: string
  product_id: string
  adjustment_type: AdjustmentType
  quantity_change: number       // positive = increase, negative = decrease
  previous_quantity: number
  new_quantity: number
  reason: string | null
  created_by: string | null
  created_at: string
}

// Joined with product name for display in the admin inventory log
export type StockAdjustmentWithProduct = StockAdjustment & {
  products: {
    name: string
    sku: string | null
  }
}

// Input type for admin stock adjustment form
export type CreateStockAdjustmentInput = {
  product_id: string
  adjustment_type: AdjustmentType
  quantity_change: number
  reason: string | null
}

// ============================================================
// STOCK RESERVATION TYPES
// ============================================================

export type StockReservation = {
  id: string
  product_id: string
  quantity: number
  reserved_by: string
  expires_at: string
  created_at: string
}

// ============================================================
// SUPPLIER TYPES
// ============================================================

export type Supplier = {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type CreateSupplierInput = {
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
}

// ============================================================
// PURCHASE ORDER TYPES
// ============================================================

export type PurchaseOrderStatus = 'pending' | 'ordered' | 'received' | 'cancelled'

export type PurchaseOrder = {
  id: string
  supplier_id: string | null
  order_number: string
  status: PurchaseOrderStatus
  total_cost: number | null
  expected_delivery: string | null   // DATE returned as ISO string
  notes: string | null
  created_by: string | null
  received_at: string | null
  created_at: string
  updated_at: string
}

export type PurchaseOrderItem = {
  id: string
  purchase_order_id: string
  product_id: string
  quantity: number
  cost_per_unit: number
  created_at: string
}

// PO with its line items and supplier name - used on the detail page
export type PurchaseOrderWithDetails = PurchaseOrder & {
  suppliers: Pick<Supplier, 'name'> | null
  purchase_order_items: (PurchaseOrderItem & {
    products: {
      name: string
      sku: string | null
    }
  })[]
}

// PO with supplier name only - used in the list view
export type PurchaseOrderWithSupplier = PurchaseOrder & {
  suppliers: Pick<Supplier, 'name'> | null
}

// Input type for creating a new PO
export type CreatePurchaseOrderInput = {
  supplier_id: string | null
  order_number: string
  expected_delivery: string | null
  notes: string | null
  items: {
    product_id: string
    quantity: number
    cost_per_unit: number
  }[]
}
