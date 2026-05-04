-- 1. Extend request_status enum with new stages
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'price_sent';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'delivered';

-- 2. Add proposal & delivery columns to service_requests
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS proposal_note TEXT,
  ADD COLUMN IF NOT EXISTS proposal_deadline DATE,
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT,
  ADD COLUMN IF NOT EXISTS delivery_file_url TEXT,
  ADD COLUMN IF NOT EXISTS delivery_note TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- 3. Tighten messages: employees CANNOT contact clients
DROP POLICY IF EXISTS "Send message on related request" ON public.messages;
DROP POLICY IF EXISTS "View messages on related request" ON public.messages;

CREATE POLICY "Client/admin send message" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.service_requests r
      WHERE r.id = messages.request_id AND r.client_id = auth.uid()
    )
  )
);

CREATE POLICY "Client/admin view messages" ON public.messages
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.service_requests r
    WHERE r.id = messages.request_id AND r.client_id = auth.uid()
  )
);

-- 4. Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meet_link TEXT,
  admin_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client creates own meeting" ON public.meetings
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Client/admin view meetings" ON public.meetings
FOR SELECT USING (auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin updates meetings" ON public.meetings
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin deletes meetings" ON public.meetings
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_meetings_updated
BEFORE UPDATE ON public.meetings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 5. Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  issue_type TEXT NOT NULL DEFAULT 'Other',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client creates own ticket" ON public.support_tickets
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Client/admin view tickets" ON public.support_tickets
FOR SELECT USING (auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin updates tickets" ON public.support_tickets
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_tickets_updated
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Ticket messages (client ↔ admin only)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Send ticket message" ON public.ticket_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_messages.ticket_id AND t.client_id = auth.uid()
    )
  )
);

CREATE POLICY "View ticket messages" ON public.ticket_messages
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_messages.ticket_id AND t.client_id = auth.uid()
  )
);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User views own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User updates own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System/admin inserts notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_request ON public.messages(request_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_service_requests_client ON public.service_requests(client_id, created_at DESC);