import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, FolderOpen, Plus, CalendarDays,
  CreditCard, MessageSquare, LifeBuoy, Activity,
  Settings, LogOut, Menu, X
} from "lucide-react";
import { LishLogo } from "@/components/lish/LishLogo";
import { CDHome } from "./CDHome";
import { CDProjects } from "./CDProjects";
import { CDNewRequest } from "./CDNewRequest";
import { CDMeetings } from "./CDMeetings";
import { CDPayments } from "./CDPayments";
import { CDMessages } from "./CDMessages";
import { CDSupport } from "./CDSupport";
import { CDActivity } from "./CDActivity";
import { CDSettings } from "./CDSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationBell } from "@/components/lish/NotificationBell";
import { NotificationPopup } from "@/components/lish/NotificationPopup";

export type CDSection =
  | "home" | "projects" | "new-request" | "meetings"
  | "payments" | "messages" | "support" | "activity" | "settings";

const NAV: { id: CDSection; label: string; Icon: React.ElementType }[] = [
  { id: "home", label: "Dashboard", Icon: LayoutDashboard },
  { id: "projects", label: "Projects", Icon: FolderOpen },
  { id: "new-request", label: "New Request", Icon: Plus },
  { id: "meetings", label: "Meetings", Icon: CalendarDays },
  { id: "payments", label: "Payments", Icon: CreditCard },
  { id: "messages", label: "Messages", Icon: MessageSquare },
  { id: "support", label: "Support", Icon: LifeBuoy },
  { id: "activity", label: "Activity", Icon: Activity },
  { id: "settings", label: "Settings", Icon: Settings },
];

const VIEWS: Record<CDSection, React.ElementType> = {
  home: CDHome,
  projects: CDProjects,
  "new-request": CDNewRequest,
  meetings: CDMeetings,
  payments: CDPayments,
  messages: CDMessages,
  support: CDSupport,
  activity: CDActivity,
  settings: CDSettings,
};

export const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const [section, setSection] = useState<CDSection>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { notifications, unreadCount, popup, markAllRead, markRead, dismissPopup } = useNotifications();

  const name = user?.user_metadata?.full_name ?? user?.email ?? "Client";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const View = VIEWS[section];

  const goTo = (s: CDSection) => { setSection(s); setMobileOpen(false); };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NotificationPopup popup={popup} onDismiss={dismissPopup} />
      {/* Sidebar */}
      <>
        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
          bg-white/80 backdrop-blur-xl border-r border-border
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Logo */}
          <div className="px-5 py-5 border-b border-border flex items-center justify-between">
            <LishLogo className="h-10 w-auto" />
            <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {id === "new-request" && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">+</span>
                )}
              </button>
            ))}
          </nav>

          {/* User + sign out */}
          <div className="px-3 py-4 border-t border-border space-y-1">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <NotificationBell unreadCount={unreadCount} notifications={notifications} onMarkAllRead={markAllRead} onMarkRead={markRead} variant="client" />
            </div>
            <button
              onClick={async () => {
                try {
                  console.log('[ClientDashboard] Sign out clicked');
                  await signOut();
                } catch (error) {
                  console.error('[ClientDashboard] Sign out error:', error);
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-white/80 backdrop-blur-sm">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <LishLogo className="h-9 w-auto" />
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell unreadCount={unreadCount} notifications={notifications} onMarkAllRead={markAllRead} onMarkRead={markRead} variant="client" />
            <span className="text-sm font-medium text-muted-foreground capitalize">{section.replace("-", " ")}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 max-w-5xl mx-auto"
            >
              <View onNavigate={goTo} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
