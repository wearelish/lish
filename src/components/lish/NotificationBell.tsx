import { useState, useRef, useEffect } from "react";
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
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const accentColor = variant === "admin" ? "bg-rose-500" : "bg-primary";

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const panelW = 320;
      const panelH = 380;
      // Position to the right of button, or left if not enough space
      let left = rect.right + 8;
      if (left + panelW > window.innerWidth - 8) left = rect.left - panelW - 8;
      // Position above button if near bottom
      let top = rect.top;
      if (top + panelH > window.innerHeight - 8) top = rect.bottom - panelH;
      setPos({ top, left });
    }
    setOpen(o => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-all relative shrink-0"
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
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{ position: "fixed", top: pos.top, left: pos.left, width: 320, zIndex: 70 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <p className="font-semibold text-sm text-stone-800">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={() => { onMarkAllRead(); setOpen(false); }}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition-colors">
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
                      <button key={n.id} onClick={() => { onMarkRead(n.id); setOpen(false); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 ${!n.is_read ? "bg-blue-50/40" : ""}`}>
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
    </>
  );
};
