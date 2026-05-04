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
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

const ROLE_KEY = "lish_role";
const getCache = (): AppRole | null => { try { return localStorage.getItem(ROLE_KEY) as AppRole | null; } catch { return null; } };
const setCache = (r: AppRole | null) => { try { r ? localStorage.setItem(ROLE_KEY, r) : localStorage.removeItem(ROLE_KEY); } catch {} };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(getCache());
  const [loading, setLoading] = useState(true);

  const loadRole = async (uid: string) => {
    try {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).limit(1);
      if (!data?.length) { setRole("client"); setCache("client"); return; }
      const r = data[0].role as AppRole;
      const resolved = r === "admin" ? "admin" : r === "employee" ? "employee" : "client";
      setRole(resolved); setCache(resolved);
    } catch { /* keep cached */ }
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      clearTimeout(t);
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) await loadRole(s.user.id);
      else { setRole(null); setCache(null); }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) await loadRole(s.user.id);
      else { setRole(null); setCache(null); }
    });
    return () => { clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    setRole(null); setUser(null); setSession(null); setCache(null);
    localStorage.clear(); sessionStorage.clear();
    window.location.href = "/";
  };

  return <Ctx.Provider value={{ session, user, role, loading, signOut }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
};
