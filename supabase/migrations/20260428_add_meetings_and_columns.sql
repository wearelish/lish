-- Fix #3: Create meetings table (used by CDNewRequest but was missing)
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Clients can insert and read their own meetings
CREATE POLICY "clients_insert_meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "clients_read_own_meetings" ON meetings
  FOR SELECT USING (auth.uid() = client_id);

-- Admins can read all meetings
CREATE POLICY "admins_read_meetings" ON meetings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Fix #8: Add stripe_payment_link, delivery_file_url, delivery_note, delivered_at,
--         proposal_note, proposal_deadline, assigned_employee_id columns
--         if they don't already exist (safe to run multiple times)
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS stripe_payment_link text,
  ADD COLUMN IF NOT EXISTS delivery_file_url text,
  ADD COLUMN IF NOT EXISTS delivery_note text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS proposal_note text,
  ADD COLUMN IF NOT EXISTS proposal_deadline date,
  ADD COLUMN IF NOT EXISTS assigned_employee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
