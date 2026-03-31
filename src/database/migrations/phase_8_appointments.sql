-- Phase 8 - Appointment Booking
-- Run in Supabase SQL editor.
--
-- Creates:
--   1. services        - the repair/installation services offered by the shop
--   2. appointments    - customer bookings against a service
--   3. RLS policies    - customers see only their own appointments; services are public
--   4. Seed data       - four initial services

-- ============================================================
-- 1. SERVICES TABLE
-- ============================================================
-- Stores the service catalog. duration_minutes drives slot availability
-- calculations - a 120-minute service blocks more slots than a 45-minute one.

CREATE TABLE services (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT          NOT NULL,
  description      TEXT,
  duration_minutes INTEGER       NOT NULL,
  price            NUMERIC(10,2) NOT NULL,
  active           BOOLEAN       NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. APPOINTMENTS TABLE
-- ============================================================
-- One row per booking. appointment_date + appointment_time are stored
-- separately (not as a single TIMESTAMPTZ) so that slot availability
-- queries can filter by date cheaply without timezone arithmetic.
--
-- end_time is derived (start + duration) and stored so availability
-- checks can use simple overlap queries rather than recalculating
-- every time.

CREATE TABLE appointments (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who / what
  user_id          UUID          NOT NULL REFERENCES auth.users(id),
  service_id       UUID          NOT NULL REFERENCES services(id),

  -- When
  appointment_date DATE          NOT NULL,
  appointment_time TIME          NOT NULL,
  end_time         TIME          NOT NULL,    -- appointment_time + duration_minutes
  duration_minutes INTEGER       NOT NULL,

  -- Lifecycle
  -- pending   - submitted, not yet reviewed by owner
  -- confirmed - owner has accepted the booking
  -- completed - service has been performed
  -- cancelled - booking cancelled by customer or owner
  status           TEXT          NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),

  -- Customer snapshot
  -- Stored on the appointment so the record is self-contained even if
  -- the user later changes their profile details.
  customer_name    TEXT          NOT NULL,
  customer_email   TEXT          NOT NULL,
  customer_phone   TEXT          NOT NULL,

  -- Equipment details (what they're bringing in / we're visiting)
  equipment_type   TEXT,
  equipment_brand  TEXT,
  issue_description TEXT,

  -- Admin-only field
  admin_notes      TEXT,

  -- Timestamps
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  confirmed_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ
);

CREATE INDEX idx_appointments_user_id          ON appointments(user_id);
CREATE INDEX idx_appointments_date             ON appointments(appointment_date);
CREATE INDEX idx_appointments_status           ON appointments(status);
CREATE INDEX idx_appointments_date_time        ON appointments(appointment_date, appointment_time);

-- ============================================================
-- 3. AUTO-UPDATE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. RLS
-- ============================================================

ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Services: anyone (including unauthenticated visitors) can read active services
CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (active = true);

-- Appointments: customers can only see and create their own rows
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: UPDATE and DELETE are intentionally excluded from customer policies.
-- Cancellations are handled server-side via the service role client so the
-- status state machine can be enforced in one place (the server action).

-- ============================================================
-- 5. SEED DATA
-- ============================================================

INSERT INTO services (name, description, duration_minutes, price) VALUES
  ('Equipment Repair',    'Professional diagnosis and repair of gym equipment. Covers cardio machines, cable systems, and strength equipment.', 120, 89.00),
  ('Home Installation',   'On-site installation of new equipment at your home or commercial premises. Includes anchoring, safety checks, and a run-through.', 90, 69.00),
  ('Equipment Assembly',  'Full assembly of flat-pack or boxed equipment. Parts checked, assembled to manufacturer spec.', 60, 49.00),
  ('Maintenance Check',   'Preventive inspection covering belts, cables, lubrication, and safety features. Report provided.', 45, 39.00);
