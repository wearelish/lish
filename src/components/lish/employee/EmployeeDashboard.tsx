import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CheckSquare, DollarSign, Activity, Menu, X, LogOut, AlertTriangle, Bell } from "lucide-react";
import { EPTasks } from "./EPTasks";
import { EPEarnings } from "./EPEarnings";
import { EPActivity } from "./EPActivity";
import { EPAttendance } from "./EPAttendance";
import { useNotifications } from "@/hooks/useNotifications";

export type EPSection = "tasks" | "earnings" | "activity";

const NAV: { id: EPSection; label: string; Icon: React.ElementType }[] = [
  { id: "tasks", label: "My Tasks", Icon: CheckSquare },
  { id: "earnings", label: "Earnings", Icon: DollarSign },
  { id: "activity", label: "Activity", Icon: Activity },
];

const VIEWS: Record<EPSection, React.ElementType> = { tasks: EPTasks, earnings: EPEarnings, activity: EPActivity };

export const EmployeeDashboard = () => {
  const { user, signOut } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const [section, setSection] = useState<EPSection>("tasks");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const name = user?.user_metadata?.full_name ?? user?.email ?? "Employee";
  const firstName = name.split(" ")[0];
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const today = now.toISOString().split("T")[0];

  const { data: checkedIn = false, refetch: refetchAttendance } = useQuery({
    queryKey: ["ep-attendance-today", user?.id, today],
    queryFn: async () => {
      const { data } = await (supabase as any).from("attendance").select("id").eq("employee_id", user!.id).eq("check_in_date", today).limit(1);
      return (data ?? []).length > 0;
    },
    enabled: !!user?.id,
  });

  const View = VIEWS[section];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF8F6]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 flex flex-col bg-white border-r border-stone-100 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <span className="font-serif text-2xl font-bold text-gradient">LISH</span>
          <button className="lg:hidden text-stone-400" onClick={() => setMobileOpen(false)}><X className="w-4 h-4" /></button>
        </div>
        <div className="px-2 py-1 mx-3 mt-3 mb-1 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold text-center py-1">Employee</p>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setSection(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === id ? "bg-primary/10 text-primary" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"}`}>
              <Icon className="w-4 h-4 shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-100">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-300 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0 flex-1"><p className="text-xs font-semibold truncate">{firstName}</p><p className="text-[10px] text-primary">Employee</p></div>
            {unreadCount > 0 && <button onClick={markAllRead} className="relative shrink-0"><Bell className="w-4 h-4 text-muted-foreground" /><span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">{unreadCount}</span></button>}
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-500 hover:bg-stone-50 transition-all"><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-stone-100 shrink-0">
          <button className="lg:hidden text-stone-400" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-800">Welcome back, {firstName} 👋</p>
            <p className="text-[11px] text-stone-400">{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </header>

        {!checkedIn && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">You haven't marked attendance today.</p>
          </div>
        )}

        <div className="px-4 sm:px-6 pt-4 shrink-0">
          <EPAttendance checkedIn={checkedIn as boolean} onCheckedIn={refetchAttendance} today={today} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <View checkedIn={checkedIn as boolean} />
          </div>
        </main>
      </div>
    </div>
  );
};
