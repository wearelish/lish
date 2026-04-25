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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  // Start as false — show landing immediately, update when auth resolves
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const loadRole = async (uid: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .limit(1);
      if (error || !data || data.length === 0) { setRole("client"); return; }
      const roles = data.map((r) => r.role as AppRole);
      if (roles.includes("admin")) setRole("admin");
      else if (roles.includes("employee")) setRole("employee");
      else setRole("client");
    } catch {
      setRole("client");
    }
  };

  useEffect(() => {
    let mounted = true;

    // Hard timeout — never block UI more than 3s
    const timeout = setTimeout(() => {
      if (mounted) setInitializing(false);
    }, 3000);

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
        await loadRole(s.user.id);
        setLoading(false);
      }
      setInitializing(false);
    }).catch(() => {
      if (mounted) setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await loadRole(s.user.id);
      } else {
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null); setUser(null); setSession(null);
  };

  const refreshRole = async () => { if (user) await loadRole(user.id); };

  // Only block render while initializing AND user is logged in (role loading)
  const isLoading = initializing || loading;

  return (
    <Ctx.Provider value={{ session, user, role, loading: isLoading, signOut, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
};
