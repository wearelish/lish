
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'client');
CREATE TYPE public.request_status AS ENUM ('pending', 'negotiating', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE public.negotiation_actor AS ENUM ('client', 'admin');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  employee_code TEXT UNIQUE,
  github_username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles (separate table — security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- has_role security definer fn
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Service requests
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC(12,2),
  deadline DATE,
  status request_status NOT NULL DEFAULT 'pending',
  final_price NUMERIC(12,2),
  assigned_employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  upfront_paid BOOLEAN NOT NULL DEFAULT false,
  final_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Negotiations (max 3 enforced in app)
CREATE TABLE public.negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  actor negotiation_actor NOT NULL,
  proposed_price NUMERIC(12,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages (client <-> admin per request)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks for employees
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, check_in_date)
);

-- Withdrawals
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  upi_or_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Trigger: auto profile + default client role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  -- Default new signups to client role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles viewable by self or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin updates any profile" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin inserts profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

-- Allow lookup of profile by employee_code (needed for employee login). Limit columns via view? We'll keep it simple: any authenticated cannot query freely; we use an RPC.
CREATE OR REPLACE FUNCTION public.get_email_by_employee_code(_code TEXT)
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT email FROM public.profiles WHERE employee_code = _code LIMIT 1;
$$;

-- user_roles policies
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manages roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- service_requests policies
CREATE POLICY "Client sees own requests" ON public.service_requests FOR SELECT USING (auth.uid() = client_id OR public.has_role(auth.uid(), 'admin') OR auth.uid() = assigned_employee_id);
CREATE POLICY "Client creates own request" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'));
CREATE POLICY "Admin updates any request" ON public.service_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Client updates own pending request" ON public.service_requests FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Admin deletes request" ON public.service_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- negotiations
CREATE POLICY "View negotiations on own/assigned/admin requests" ON public.negotiations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND (r.client_id = auth.uid() OR r.assigned_employee_id = auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Client/admin add negotiation" ON public.negotiations FOR INSERT WITH CHECK (
  (actor = 'admin' AND public.has_role(auth.uid(), 'admin'))
  OR (actor = 'client' AND EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND r.client_id = auth.uid()))
);

-- messages
CREATE POLICY "View messages on related request" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND r.client_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Send message on related request" ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND (
    EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND r.client_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- tasks
CREATE POLICY "Employee sees own tasks; admin all" ON public.tasks FOR SELECT USING (auth.uid() = employee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manages tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employee updates own task status" ON public.tasks FOR UPDATE USING (auth.uid() = employee_id);

-- attendance
CREATE POLICY "Employee sees own attendance; admin all" ON public.attendance FOR SELECT USING (auth.uid() = employee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employee checks in" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = employee_id AND public.has_role(auth.uid(), 'employee'));

-- withdrawals
CREATE POLICY "Employee sees own withdrawals; admin all" ON public.withdrawals FOR SELECT USING (auth.uid() = employee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employee requests withdrawal" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = employee_id AND public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Admin processes withdrawal" ON public.withdrawals FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
