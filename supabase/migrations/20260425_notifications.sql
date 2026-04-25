-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info | success | warning | error
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Indexes on existing tables for performance
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON public.service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_tasks_employee_id ON public.tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance(employee_id, check_in_date);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Helper function: create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID, _message TEXT, _type TEXT DEFAULT 'info'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type)
  VALUES (_user_id, _message, _type);
END;
$$;

-- Trigger: notify admin when new request created
CREATE OR REPLACE FUNCTION public.notify_on_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID;
BEGIN
  -- Notify all admins
  FOR _admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    PERFORM public.create_notification(_admin_id, 'New request: ' || NEW.title, 'info');
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_request ON public.service_requests;
CREATE TRIGGER trg_notify_request
  AFTER INSERT ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_request();

-- Trigger: notify client when request status changes
CREATE OR REPLACE FUNCTION public.notify_on_request_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.create_notification(
      NEW.client_id,
      'Your request "' || NEW.title || '" is now ' || NEW.status,
      CASE WHEN NEW.status = 'accepted' THEN 'success'
           WHEN NEW.status = 'rejected' THEN 'warning'
           ELSE 'info' END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_request_status ON public.service_requests;
CREATE TRIGGER trg_notify_request_status
  AFTER UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_request_status();

-- Trigger: notify employee when task assigned
CREATE OR REPLACE FUNCTION public.notify_on_task()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.employee_id,
    'New task assigned: ' || NEW.title,
    'info'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_task ON public.tasks;
CREATE TRIGGER trg_notify_task
  AFTER INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_task();

-- Trigger: notify admin when task completed
CREATE OR REPLACE FUNCTION public.notify_on_task_done()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'done' THEN
    FOR _admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
      PERFORM public.create_notification(_admin_id, 'Task completed: ' || NEW.title, 'success');
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_task_done ON public.tasks;
CREATE TRIGGER trg_notify_task_done
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_task_done();
