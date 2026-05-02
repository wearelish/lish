import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare, BarChart2, DollarSign, Activity,
  Menu, X, LogOut, ChevronDown, AlertTriangle
} from "lucide-react";
import { LishLogo } from "@/components/lish/LishLogo";
import { EPAttendance } from "./EPAttendance";
import { EPTasks } from "./EPTasks";
import { EPPerformance } from "./EPPerformance";
import { EPEarnings } from "./EPEarnings";
import { EPActivity } from "./EPActivity";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationBell } from "@/components/lish/NotificationBell";
import { NotificationPopup } from "@/components/lish/NotificationPopup";

export type EPSection = "tasks" | "performance" | "earnings" | "activity";

const NAV: { id: EPSection; label: string; Icon: React.ElementType }[] = [
  { id: "tasks", label: "My Tasks", Icon: CheckSquare },
  { id: "performance", label: "Performance", Icon: BarChart2 },
  { id: "earnings", label: "Earnings", Icon: DollarSign },
  { id: "activity", label: "Activity Log", Icon: Activity },
];

const VIEWS: Record<EPSection, React.ElementType> = {
  tasks: EPTasks,
  performance: EPPerformance,
  earnings: EPEarnings,
  activity: EPActivity,
};

const db = supabase as any;

export const EmployeeDashboard = () => {
  const { user, signOut } = useAuth();
  const uid = user?.id;
  const [section, setSection] = useState<EPSection>("tasks");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const name = user?.user_metadata?.full_name ?? user?.email ?? "Employee";
  const firstName = name.split(" ")[0];
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const today = now.toISOString().split("T")[0];

  const { data: checkedIn = false, refetch: refetchAttendance } = useQuery({
    queryKey: ["ep-attendance-today", uid, today],
    queryFn: async () => {
      const { data } = await db.from("attendance").select("id").eq("employee_id", uid!).eq("check_in_date", today).limit(1);
      return (data ?? []).length > 0;
    },
    enabled: !!uid,
  });

  const { notifications, unreadCount, popup, markAllRead, markRead, dismissPopup } = useNotifications();

  const View = VIEWS[section];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF8F6]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <NotificationPopup popup={popup} onDismiss={dismissPopup} />

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 flex flex-col bg-white border-r border-stone-100 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <LishLogo className="h-10 w-auto" />
          <button className="lg:hidden text-stone-400" onClick={() => setMobileOpen(false)}><X className="w-4 h-4" /></button>
        </div>

        <div className="px-2 py-1 mx-3 mt-3 mb-1 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold text-center py-1">Employee</p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setSection(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                section === id ? "bg-primary/10 text-primary" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-stone-100">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{firstName}</p>
              <p className="text-[10px] text-primary">Employee</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              try {
                console.log('[EmployeeDashboard] Sign out clicked');
                await signOut();
              } catch (error) {
                console.error('[EmployeeDashboard] Sign out error:', error);
              }
            }} 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-500 hover:bg-stone-50 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-stone-100 shrink-0">
          <button className="lg:hidden text-stone-400" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-800">Welcome back, {firstName} 👋</p>
            <p className="text-[11px] text-stone-400">
              {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 cursor-pointer hover:bg-stone-200 transition-all">
            <NotificationBell unreadCount={unreadCount} notifications={notifications} onMarkAllRead={markAllRead} onMarkRead={markRead} variant="employee" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white text-[10px] font-bold">{initials}</div>
            <span className="text-xs font-medium text-stone-700 hidden sm:block">{firstName}</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </div>
        </header>

        {/* Attendance warning banner */}
        <AnimatePresence>
          {!checkedIn && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-hidden">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">You haven't marked attendance today. Mark it below to unlock full task access.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attendance card — always visible at top */}
        <div className="px-4 sm:px-6 pt-4 shrink-0">
          <EPAttendance checkedIn={checkedIn} onCheckedIn={refetchAttendance} today={today} />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
              className="p-4 sm:p-6 max-w-5xl mx-auto">
              <View checkedIn={checkedIn} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
