-- ============================================================
-- LISH PLATFORM — COMPLETE SUPABASE SETUP FROM SCRATCH
-- Run this entire file once in Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================================


-- ============================================================
-- STEP 1: ENUMS
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'client');
CREATE TYPE public.request_status AS ENUM (
  'pending', 'under_review', 'price_sent', 'negotiating',
  'accepted', 'rejected', 'in_progress', 'delivered', 'completed', 'cancelled'
);
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE public.negotiation_actor AS ENUM ('client', 'admin');


-- ============================================================
-- STEP 2: TABLES
-- ============================================================

-- Profiles (auto-created on signup via trigger)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  avatar_url    TEXT,
  employee_code TEXT UNIQUE,
  github_username TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Service requests (core table)
CREATE TABLE public.service_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  budget               NUMERIC(12,2),
  deadline             DATE,
  status               request_status NOT NULL DEFAULT 'pending',
  -- Proposal fields (filled by admin)
  final_price          NUMERIC(12,2),
  scope_of_work        TEXT,
  proposal_note        TEXT,
  proposal_deadline    DATE,
  -- Payment
  upfront_paid         BOOLEAN NOT NULL DEFAULT false,
  final_paid           BOOLEAN NOT NULL DEFAULT false,
  stripe_payment_link  TEXT,
  -- Delivery
  delivery_file_url    TEXT,
  delivery_note        TEXT,
  delivered_at         TIMESTAMPTZ,
  -- Rejection
  rejection_reason     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages (client <-> admin per request)
CREATE TABLE public.messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks (assigned to employees)
CREATE TABLE public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  employee_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       task_status NOT NULL DEFAULT 'todo',
  deadline     DATE,
  progress_note TEXT,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance
CREATE TABLE public.attendance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, check_in_date)
);

-- Withdrawals
CREATE TABLE public.withdrawals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount         NUMERIC(12,2) NOT NULL,
  upi_or_method  TEXT,
  status         TEXT NOT NULL DEFAULT 'pending',
  processed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meetings
CREATE TABLE public.meetings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  meet_link    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support tickets
CREATE TABLE public.support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  issue_type  TEXT NOT NULL DEFAULT 'Other',
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket messages
CREATE TABLE public.ticket_messages (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- STEP 3: HELPER FUNCTIONS
-- ============================================================

-- Check if a user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Get email by employee code (used for employee login)
CREATE OR REPLACE FUNCTION public.get_email_by_employee_code(_code TEXT)
RETURNS TEXT
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT email FROM public.profiles WHERE employee_code = _code LIMIT 1;
$$;

-- Set role on signup with access code verification
CREATE OR REPLACE FUNCTION public.set_signup_role(
  _user_id UUID,
  _role    app_role,
  _code    TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _expected TEXT;
BEGIN
  -- Validate employee code
  IF _role = 'employee' THEN
    _expected := COALESCE(current_setting('app.employee_signup_code', true), 'LISH-EMP-2024');
    IF _code IS DISTINCT FROM _expected THEN RETURN FALSE; END IF;
  END IF;

  -- Validate admin code
  IF _role = 'admin' THEN
    _expected := COALESCE(current_setting('app.admin_signup_code', true), 'LISH-ADMIN-SECRET');
    IF _code IS DISTINCT FROM _expected THEN RETURN FALSE; END IF;
  END IF;

  -- Replace default client role with requested role
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;

-- Send notification helper
CREATE OR REPLACE FUNCTION public.notify_user(
  _user_id UUID,
  _message TEXT,
  _type    TEXT DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type)
  VALUES (_user_id, _message, _type);
END;
$$;

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


-- ============================================================
-- STEP 4: TRIGGERS
-- ============================================================

-- Auto-create profile + default client role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_requests_updated
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_tasks_updated
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_tickets_updated
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Notify client when request status changes
CREATE OR REPLACE FUNCTION public.trg_request_status_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.notify_user(
      NEW.client_id,
      CASE NEW.status
        WHEN 'under_review' THEN 'Your request "' || NEW.title || '" is now under review.'
        WHEN 'price_sent'   THEN 'Admin sent a proposal for "' || NEW.title || '". Check your projects!'
        WHEN 'in_progress'  THEN 'Work has started on "' || NEW.title || '"!'
        WHEN 'delivered'    THEN 'Your project "' || NEW.title || '" has been delivered. Pay the final amount to download.'
        WHEN 'completed'    THEN 'Project "' || NEW.title || '" is complete!'
        WHEN 'rejected'     THEN 'Your request "' || NEW.title || '" was not accepted.'
        ELSE NULL
      END,
      CASE NEW.status
        WHEN 'price_sent' THEN 'success'
        WHEN 'delivered'  THEN 'success'
        WHEN 'completed'  THEN 'success'
        WHEN 'rejected'   THEN 'error'
        ELSE 'info'
      END
    );
  END IF;
  -- Notify assigned employee when project goes in_progress
  IF NEW.status = 'in_progress' AND NEW.assigned_employee_id IS NOT NULL THEN
    PERFORM public.notify_user(
      NEW.assigned_employee_id,
      'Project "' || NEW.title || '" is now active. Check your tasks.',
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER request_status_notify
  AFTER UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.trg_request_status_notify();

-- Notify admin on new request
CREATE OR REPLACE FUNCTION public.trg_new_request_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type)
  SELECT ur.user_id, 'New service request: "' || NEW.title || '"', 'info'
  FROM public.user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

CREATE TRIGGER new_request_notify
  AFTER INSERT ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.trg_new_request_notify();

-- Notify employee when task assigned
CREATE OR REPLACE FUNCTION public.trg_task_assigned_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.notify_user(
    NEW.employee_id,
    'New task assigned: "' || NEW.title || '".',
    'info'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER task_assigned_notify
  AFTER INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.trg_task_assigned_notify();

-- Notify client when admin sends a message
CREATE OR REPLACE FUNCTION public.trg_message_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _client_id UUID;
  _req_title TEXT;
BEGIN
  SELECT client_id, title INTO _client_id, _req_title
  FROM public.service_requests WHERE id = NEW.request_id;

  IF NEW.sender_id != _client_id THEN
    PERFORM public.notify_user(_client_id, 'New message on "' || _req_title || '"', 'info');
  ELSE
    INSERT INTO public.notifications (user_id, message, type)
    SELECT ur.user_id, 'Client replied on "' || _req_title || '"', 'info'
    FROM public.user_roles ur WHERE ur.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_message_notify();

-- Notify admin on new support ticket
CREATE OR REPLACE FUNCTION public.trg_ticket_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type)
  SELECT ur.user_id, 'New support ticket: "' || NEW.title || '"', 'warning'
  FROM public.user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

CREATE TRIGGER ticket_notify
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.trg_ticket_notify();

-- Notify admin on new withdrawal
CREATE OR REPLACE FUNCTION public.trg_withdrawal_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, message, type)
    SELECT ur.user_id, 'New withdrawal request of $' || NEW.amount, 'warning'
    FROM public.user_roles ur WHERE ur.role = 'admin';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM public.notify_user(
      NEW.employee_id,
      CASE NEW.status
        WHEN 'approved' THEN 'Your withdrawal of $' || NEW.amount || ' has been approved!'
        WHEN 'rejected' THEN 'Your withdrawal of $' || NEW.amount || ' was rejected.'
      END,
      CASE NEW.status WHEN 'approved' THEN 'success' ELSE 'error' END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER withdrawal_notify
  AFTER INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.trg_withdrawal_notify();

-- Notify client when meeting is scheduled
CREATE OR REPLACE FUNCTION public.trg_meeting_notify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, message, type)
    SELECT ur.user_id, 'New meeting request: "' || NEW.title || '"', 'info'
    FROM public.user_roles ur WHERE ur.role = 'admin';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'scheduled' THEN
    PERFORM public.notify_user(NEW.client_id, 'Your meeting "' || NEW.title || '" has been scheduled!', 'success');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER meeting_notify
  AFTER INSERT OR UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.trg_meeting_notify();


-- ============================================================
-- STEP 5: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "roles_select" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- service_requests
CREATE POLICY "requests_select" ON public.service_requests FOR SELECT
  USING (
    auth.uid() = client_id
    OR auth.uid() = assigned_employee_id
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "requests_insert" ON public.service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY "requests_update_admin" ON public.service_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "requests_update_client" ON public.service_requests FOR UPDATE
  USING (auth.uid() = client_id);

-- messages
CREATE POLICY "messages_select" ON public.messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND r.client_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "messages_insert" ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND r.client_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- tasks
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT
  USING (auth.uid() = employee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "tasks_admin_all" ON public.tasks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "tasks_employee_update" ON public.tasks FOR UPDATE
  USING (auth.uid() = employee_id);

-- attendance
CREATE POLICY "attendance_select" ON public.attendance FOR SELECT
  USING (auth.uid() = employee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "attendance_insert" ON public.attendance FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

-- withdrawals
CREATE POLICY "withdrawals_select" ON public.withdrawals FOR SELECT
  USING (auth.uid() = employee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "withdrawals_insert" ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "withdrawals_admin_update" ON public.withdrawals FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- meetings
CREATE POLICY "meetings_all" ON public.meetings FOR ALL
  USING (auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'));

-- support_tickets
CREATE POLICY "tickets_all" ON public.support_tickets FOR ALL
  USING (auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'));

-- ticket_messages
CREATE POLICY "ticket_msgs_select" ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.client_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "ticket_msgs_insert" ON public.ticket_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.client_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- notifications
CREATE POLICY "notifications_own" ON public.notifications FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- DONE
-- All tables, functions, triggers, and RLS policies are set up.
-- Access codes:
--   Employee signup: LISH-EMP-2024
--   Admin signup:    LISH-ADMIN-SECRET
-- ============================================================
