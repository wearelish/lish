-- RPC: set role on signup with code verification
-- Called client-side right after supabase.auth.signUp succeeds
CREATE OR REPLACE FUNCTION public.set_signup_role(
  _user_id UUID,
  _role app_role,
  _code TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _expected TEXT;
BEGIN
  -- Validate codes for protected roles
  IF _role = 'employee' THEN
    _expected := current_setting('app.employee_signup_code', true);
    IF _expected IS NULL OR _expected = '' THEN
      _expected := 'LISH-EMP-2024';
    END IF;
    IF _code IS DISTINCT FROM _expected THEN
      RETURN FALSE;
    END IF;
  END IF;

  IF _role = 'admin' THEN
    _expected := current_setting('app.admin_signup_code', true);
    IF _expected IS NULL OR _expected = '' THEN
      _expected := 'LISH-ADMIN-SECRET';
    END IF;
    IF _code IS DISTINCT FROM _expected THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Remove default client role, insert requested role
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;
