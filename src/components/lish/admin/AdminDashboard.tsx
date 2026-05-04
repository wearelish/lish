import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { LayoutDashboard, FileText, FolderKanban, Users, CreditCard, Wallet, Settings, Menu, X, LogOut, MessageSquare, LifeBuoy, CalendarDays, Bell } from "lucide-react";
import { ADHome } from "./ADHome";
import { ADRequests } from "./ADRequests";
import { ADProjects } from "./ADProjects";
import { ADEmployees } from "./ADEmployees";
import { ADPayments } from "./ADPayments";
import { ADWithdrawals } from "./ADWithdrawals";
import { ADMessages } from "./ADMessages";
import { ADSupport } from "./ADSupport";
import { ADMeetings } from "./ADMeetings";
import { ADSettings } from "./ADSettings";

export type ADSection = "home" | "requests" | "projects" | "employees" | "payments" | "withdrawals" | "messages" | "support" | "meetings" | "settings";

const NAV: { id: ADSection; label: string; Icon: React.ElementType }[] = [
  { id: "home", label: "Dashboard", Icon: LayoutDashboard },
  { id: "requests", label: "Requests", Icon: FileText },
  { id: "projects", label: "Projects", Icon: FolderKanban },
  { id: "employees", label: "Employees", Icon: Users },
  { id: "payments", label: "Payments", Icon: CreditCard },
  { id: "withdrawals", label: "Withdrawals", Icon: Wallet },
  { id: "messages", label: "Messages", Icon: MessageSquare },
  { id: "support", label: "Support", Icon: LifeBuoy },
  { id: "meetings", label: "Meetings", Icon: CalendarDays },
  { id: "settings", label: "Settings", Icon: Settings },
];

const VIEWS: Record<ADSection, React.ElementType> = {
  home: ADHome, requests: ADRequests, projects: ADProjects, employees: ADEmployees,
  payments: ADPayments, withdrawals: ADWithdrawals, messages: ADMessages,
  support: ADSupport, meetings: ADMeetings, settings: ADSettings,
};

export const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const [section, setSection] = useState<ADSection>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = user?.user_metadata?.full_name ?? user?.email ?? "Admin";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const View = VIEWS[section];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4F2]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 flex flex-col bg-white border-r border-stone-200 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <span className="font-serif text-2xl font-bold text-gradient">LISH</span>
          <button className="lg:hidden text-stone-400" onClick={() => setMobileOpen(false)}><X className="w-4 h-4" /></button>
        </div>
        <div className="px-2 py-1 mx-3 mt-3 mb-1 rounded-lg bg-rose-50 border border-rose-100">
          <p className="text-[10px] uppercase tracking-widest text-rose-500 font-semibold text-center py-1">Admin Control</p>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setSection(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === id ? "bg-rose-50 text-rose-600 border border-rose-100" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"}`}>
              <Icon className="w-4 h-4 shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0 flex-1"><p className="text-xs font-semibold truncate">{name}</p><p className="text-[10px] text-rose-500 font-medium">Administrator</p></div>
            {unreadCount > 0 && <button onClick={markAllRead} className="relative shrink-0"><Bell className="w-4 h-4 text-muted-foreground" /><span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">{unreadCount}</span></button>}
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-all"><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-stone-200 shrink-0">
          <button className="lg:hidden text-stone-400" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex-1"><h2 className="text-sm font-semibold text-stone-800 capitalize">{section.replace("-", " ")}</h2><p className="text-[11px] text-stone-400">LISH Admin Panel</p></div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7 max-w-7xl mx-auto">
            <View onNavigate={(s: ADSection) => setSection(s)} />
          </div>
        </main>
      </div>
    </div>
  );
};
