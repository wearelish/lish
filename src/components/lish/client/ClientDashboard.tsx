import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { LayoutDashboard, FolderOpen, Plus, CalendarDays, CreditCard, MessageSquare, LifeBuoy, Settings, LogOut, Menu, X, Bell } from "lucide-react";
import { CDHome } from "./CDHome";
import { CDProjects } from "./CDProjects";
import { CDNewRequest } from "./CDNewRequest";
import { CDMeetings } from "./CDMeetings";
import { CDPayments } from "./CDPayments";
import { CDMessages } from "./CDMessages";
import { CDSupport } from "./CDSupport";
import { CDSettings } from "./CDSettings";

export type CDSection = "home" | "projects" | "new-request" | "meetings" | "payments" | "messages" | "support" | "settings";

const NAV: { id: CDSection; label: string; Icon: React.ElementType }[] = [
  { id: "home", label: "Dashboard", Icon: LayoutDashboard },
  { id: "projects", label: "My Projects", Icon: FolderOpen },
  { id: "new-request", label: "New Request", Icon: Plus },
  { id: "meetings", label: "Meetings", Icon: CalendarDays },
  { id: "payments", label: "Payments", Icon: CreditCard },
  { id: "messages", label: "Messages", Icon: MessageSquare },
  { id: "support", label: "Support", Icon: LifeBuoy },
  { id: "settings", label: "Settings", Icon: Settings },
];

const VIEWS: Record<CDSection, React.ElementType> = {
  home: CDHome, projects: CDProjects, "new-request": CDNewRequest,
  meetings: CDMeetings, payments: CDPayments, messages: CDMessages,
  support: CDSupport, settings: CDSettings,
};

export const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const [section, setSection] = useState<CDSection>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = user?.user_metadata?.full_name ?? user?.email ?? "Client";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const View = VIEWS[section];
  const goTo = (s: CDSection) => { setSection(s); setMobileOpen(false); };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-white/80 backdrop-blur-xl border-r border-border transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <span className="font-serif text-2xl font-bold text-gradient">LISH</span>
          <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => goTo(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Icon className="w-4 h-4 shrink-0" />{label}
              {id === "new-request" && <span className="ml-auto w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">+</span>}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-300 flex items-center justify-center text-white text-xs font-semibold shrink-0">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="relative shrink-0">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">{unreadCount}</span>
              </button>
            )}
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-white/80 backdrop-blur-sm">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground"><Menu className="w-5 h-5" /></button>
          <span className="font-serif text-xl font-bold text-gradient">LISH</span>
          <span className="ml-auto text-sm font-medium text-muted-foreground capitalize">{section.replace("-", " ")}</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 max-w-5xl mx-auto">
            <View onNavigate={goTo} />
          </div>
        </main>
      </div>
    </div>
  );
};
