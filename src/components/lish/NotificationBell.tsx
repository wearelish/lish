import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, CheckCheck } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";

const TYPE_ICON: Record<string, React.ElementType> = {
  success: CheckCircle2, info: Info, warning: AlertTriangle, error: XCircle,
};
const TYPE_COLOR: Record<string, string> = {
  success: "text-emerald-500", info: "text-blue-500", warning: "text-amber-500", error: "text-red-500",
};

interface Props {
  unreadCount: number;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  variant?: "admin" | "employee" | "client";
}

export const NotificationBell = ({ unreadCount, notifications, onMarkAllRead, onMarkRead, variant = "admin" }: Props) => {
  const [open, setOpen] = useState(false);

  const accentColor = variant === "admin" ? "bg-rose-500" : variant === "employee" ? "bg-primary" : "bg-primary";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-all relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${accentColor} text-white text-[9px] font-bold flex items-center justify-center`}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-80 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <p className="font-semibold text-sm text-stone-800">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={onMarkAllRead} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                    <p className="text-xs text-stone-400">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const Icon = TYPE_ICON[n.type] ?? Info;
                    const color = TYPE_COLOR[n.type] ?? "text-blue-500";
                    return (
                      <button key={n.id} onClick={() => { onMarkRead(n.id); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 ${!n.is_read ? "bg-stone-50/80" : ""}`}>
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-snug ${!n.is_read ? "font-semibold text-stone-800" : "text-stone-600"}`}>{n.message}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
