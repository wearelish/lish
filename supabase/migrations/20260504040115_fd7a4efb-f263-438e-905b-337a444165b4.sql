CREATE OR REPLACE FUNCTION public.set_signup_role(_user_id uuid, _role app_role, _code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_code TEXT := 'LISH-ADMIN-2024';
  employee_code TEXT := 'LISH-EMP-2024';
BEGIN
  -- Only the freshly-signed-up user can promote themselves and only with a valid code
  IF _user_id <> auth.uid() THEN RETURN FALSE; END IF;

  IF _role = 'admin' AND _code = admin_code THEN
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin');
    RETURN TRUE;
  ELSIF _role = 'employee' AND _code = employee_code THEN
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'employee');
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;