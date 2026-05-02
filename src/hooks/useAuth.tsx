import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "employee" | "client";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signingOut: boolean; // Add this to expose signing out state
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
  const [signingOut, setSigningOut] = useState(false); // Prevent double-clicks

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
    // Prevent multiple simultaneous sign-out attempts
    if (signingOut) {
      console.log('[useAuth] Sign out already in progress, ignoring duplicate call');
      return;
    }

    setSigningOut(true);
    console.log('[useAuth] Sign out initiated');
    console.log('[useAuth] Current user:', user?.id);
    console.log('[useAuth] Current session:', session?.access_token ? 'exists' : 'none');

    try {
      // Step 1: Call Supabase sign out with timeout
      console.log('[useAuth] Calling Supabase signOut...');
      
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout after 5 seconds')), 5000)
      );

      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('[useAuth] Supabase sign out error:', error);
        // Don't throw - we'll clear local state anyway
      } else {
        console.log('[useAuth] Supabase sign out successful');
      }
    } catch (error) {
      console.error('[useAuth] Sign out API call failed:', error);
      // Continue to clear local state even if API fails
    }

    // Step 2: Clear all local state (always execute, even if API fails)
    console.log('[useAuth] Clearing local state...');
    try {
      setRole(null);
      setUser(null);
      setSession(null);
      setCachedRole(null);
      
      // Clear all localStorage items related to auth
      localStorage.removeItem(ROLE_CACHE_KEY);
      localStorage.removeItem('supabase.auth.token');
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      console.log('[useAuth] Local state cleared successfully');
    } catch (error) {
      console.error('[useAuth] Error clearing local state:', error);
    }

    // Step 3: Redirect to home page
    console.log('[useAuth] Redirecting to home page...');
    
    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  const refreshRole = async () => { if (user) await loadRole(user.id); };

  return (
    <Ctx.Provider value={{ session, user, role, loading, signingOut, signOut, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
};
