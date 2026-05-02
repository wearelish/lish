-- ============================================================
-- Full interconnectivity migration
-- ============================================================

-- 1. Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  issue_type text NOT NULL DEFAULT 'Other',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_own_tickets" ON support_tickets
  FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "admins_all_tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 2. Ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_participants_read" ON ticket_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND client_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "ticket_participants_insert" ON ticket_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND client_id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    )
  );

-- 3. Notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admins_insert_notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'employee', 'client'))
  );

-- 4. Add requested_at and meet_link to meetings
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS meet_link text;

-- 5. Add completed_at to tasks
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS deadline date;

-- 6. Helper function: send notification to a user
CREATE OR REPLACE FUNCTION notify_user(
  _user_id uuid,
  _message text,
  _type text DEFAULT 'info'
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, message, type)
  VALUES (_user_id, _message, _type);
END;
$$;

-- 7. Trigger: notify client when service_request status changes
CREATE OR REPLACE FUNCTION trg_request_status_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM notify_user(
      NEW.client_id,
      CASE NEW.status
        WHEN 'under_review' THEN 'Your request "' || NEW.title || '" is now under review.'
        WHEN 'price_sent'   THEN 'Admin sent a price proposal for "' || NEW.title || '". Check your projects!'
        WHEN 'in_progress'  THEN 'Work has started on "' || NEW.title || '"!'
        WHEN 'delivered'    THEN 'Your project "' || NEW.title || '" has been delivered. Pay the final amount to download.'
        WHEN 'completed'    THEN 'Project "' || NEW.title || '" is complete. Thank you!'
        WHEN 'rejected'     THEN 'Your request "' || NEW.title || '" was not accepted. Contact support for details.'
        ELSE NULL
      END,
      CASE NEW.status
        WHEN 'price_sent'  THEN 'success'
        WHEN 'delivered'   THEN 'success'
        WHEN 'completed'   THEN 'success'
        WHEN 'rejected'    THEN 'error'
        ELSE 'info'
      END
    );
  END IF;

  -- Notify assigned employee when project goes in_progress
  IF NEW.status = 'in_progress' AND NEW.assigned_employee_id IS NOT NULL THEN
    PERFORM notify_user(
      NEW.assigned_employee_id,
      'Project "' || NEW.title || '" is now active. Check your tasks.',
      'info'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS request_status_notify ON service_requests;
CREATE TRIGGER request_status_notify
  AFTER UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION trg_request_status_notify();

-- 8. Trigger: notify employee when a task is assigned
CREATE OR REPLACE FUNCTION trg_task_assigned_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM notify_user(
      NEW.employee_id,
      'New task assigned: "' || NEW.title || '". Check your task list.',
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_assigned_notify ON tasks;
CREATE TRIGGER task_assigned_notify
  AFTER INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION trg_task_assigned_notify();

-- 9. Trigger: notify client when a message is sent to their request
CREATE OR REPLACE FUNCTION trg_message_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _client_id uuid;
  _req_title text;
BEGIN
  SELECT client_id, title INTO _client_id, _req_title
  FROM service_requests WHERE id = NEW.request_id;

  -- Only notify if sender is NOT the client (i.e. admin/employee messaging client)
  IF NEW.sender_id != _client_id THEN
    PERFORM notify_user(
      _client_id,
      'New message on "' || _req_title || '"',
      'info'
    );
  ELSE
    -- Notify admins when client sends a message (notify all admins)
    INSERT INTO notifications (user_id, message, type)
    SELECT ur.user_id, 'Client replied on "' || _req_title || '"', 'info'
    FROM user_roles ur WHERE ur.role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS message_notify ON messages;
CREATE TRIGGER message_notify
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION trg_message_notify();

-- 10. Trigger: notify admin when a new support ticket is created
CREATE OR REPLACE FUNCTION trg_ticket_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, message, type)
  SELECT ur.user_id, 'New support ticket: "' || NEW.title || '"', 'warning'
  FROM user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_notify ON support_tickets;
CREATE TRIGGER ticket_notify
  AFTER INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION trg_ticket_notify();

-- 11. Trigger: notify client when admin replies to ticket
CREATE OR REPLACE FUNCTION trg_ticket_msg_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _client_id uuid;
  _ticket_title text;
BEGIN
  SELECT client_id, title INTO _client_id, _ticket_title
  FROM support_tickets WHERE id = NEW.ticket_id;

  IF NEW.sender_id != _client_id THEN
    PERFORM notify_user(
      _client_id,
      'Admin replied to your ticket: "' || _ticket_title || '"',
      'info'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_msg_notify ON ticket_messages;
CREATE TRIGGER ticket_msg_notify
  AFTER INSERT ON ticket_messages
  FOR EACH ROW EXECUTE FUNCTION trg_ticket_msg_notify();

-- 12. Trigger: notify client when meeting is scheduled/updated
CREATE OR REPLACE FUNCTION trg_meeting_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM notify_user(
      NEW.client_id,
      CASE NEW.status
        WHEN 'scheduled' THEN 'Your meeting "' || NEW.title || '" has been scheduled!'
        WHEN 'completed' THEN 'Meeting "' || NEW.title || '" marked as completed.'
        ELSE 'Meeting "' || NEW.title || '" status updated to ' || NEW.status
      END,
      'success'
    );
  END IF;

  -- Notify admins on new meeting request
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, message, type)
    SELECT ur.user_id, 'New meeting request: "' || NEW.title || '"', 'info'
    FROM user_roles ur WHERE ur.role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS meeting_notify ON meetings;
CREATE TRIGGER meeting_notify
  AFTER INSERT OR UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION trg_meeting_notify();

-- 13. Trigger: notify admin on new service request
CREATE OR REPLACE FUNCTION trg_new_request_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, message, type)
  SELECT ur.user_id, 'New service request: "' || NEW.title || '"', 'info'
  FROM user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS new_request_notify ON service_requests;
CREATE TRIGGER new_request_notify
  AFTER INSERT ON service_requests
  FOR EACH ROW EXECUTE FUNCTION trg_new_request_notify();

-- 14. Trigger: notify admin on new withdrawal request
CREATE OR REPLACE FUNCTION trg_withdrawal_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, message, type)
    SELECT ur.user_id, 'New withdrawal request of $' || NEW.amount, 'warning'
    FROM user_roles ur WHERE ur.role = 'admin';
  END IF;

  -- Notify employee when withdrawal is processed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM notify_user(
      NEW.employee_id,
      CASE NEW.status
        WHEN 'approved' THEN 'Your withdrawal of $' || NEW.amount || ' has been approved!'
        WHEN 'rejected' THEN 'Your withdrawal of $' || NEW.amount || ' was rejected. Contact admin.'
      END,
      CASE NEW.status WHEN 'approved' THEN 'success' ELSE 'error' END
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS withdrawal_notify ON withdrawals;
CREATE TRIGGER withdrawal_notify
  AFTER INSERT OR UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION trg_withdrawal_notify();
