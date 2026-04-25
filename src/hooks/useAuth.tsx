import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "employee" | "client";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

const ROLE_CACHE_KEY = "lish_role";

const getCachedRole = (): AppRole | null => {
  try { return localStorage.getItem(ROLE_CACHE_KEY) as AppRole | null; } catch { return null; }
};
const setCachedRole = (r: AppRole | null) => {
  try { r ? localStorage.setItem(ROLE_CACHE_KEY, r) : localStorage.removeItem(ROLE_CACHE_KEY); } catch {}
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // Start with cached role so dashboard shows instantly on refresh
  const [role, setRole] = useState<AppRole | null>(getCachedRole());
  const [loading, setLoading] = useState(true);

  const loadRole = async (uid: string): Promise<void> => {
    try {
      const { data } = await supabase
        .from("user_roles").select("role").eq("user_id", uid).limit(1);
      if (!data || data.length === 0) { setRole("client"); setCachedRole("client"); return; }
      const roles = data.map((r) => r.role as AppRole);
      const resolved = roles.includes("admin") ? "admin" : roles.includes("employee") ? "employee" : "client";
      setRole(resolved);
      setCachedRole(resolved);
    } catch {
      // Keep cached role on network error
    }
  };

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => { if (mounted) setLoading(false); }, 2000);

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await loadRole(s.user.id);
      } else {
        setRole(null);
        setCachedRole(null);
      }
      setLoading(false);
    }).catch(() => { if (mounted) setLoading(false); });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await loadRole(s.user.id);
      } else {
        setRole(null);
        setCachedRole(null);
      }
    });

    return () => { mounted = false; clearTimeout(timeout); sub.subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null); setUser(null); setSession(null);
    setCachedRole(null);
    // Force page reload to clear all state cleanly
    window.location.href = "/";
  };

  const refreshRole = async () => { if (user) await loadRole(user.id); };

  return (
    <Ctx.Provider value={{ session, user, role, loading, signOut, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
};
