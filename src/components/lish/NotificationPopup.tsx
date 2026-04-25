import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import type { PopupNotification } from "@/hooks/useNotifications";

const ICONS = {
  success: { Icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  info: { Icon: Info, color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  warning: { Icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
  error: { Icon: XCircle, color: "text-red-500", bg: "bg-red-50 border-red-200" },
};

interface Props {
  popup: PopupNotification | null;
  onDismiss: () => void;
}

export const NotificationPopup = ({ popup, onDismiss }: Props) => {
  const cfg = popup ? (ICONS[popup.type] ?? ICONS.info) : ICONS.info;

  return (
    <div className="fixed top-4 right-4 z-[200] pointer-events-none">
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.popupId}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg max-w-xs ${cfg.bg}`}
          >
            <cfg.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
            <p className="text-sm text-stone-800 font-medium flex-1 leading-snug">{popup.message}</p>
            <button onClick={onDismiss} className="text-stone-400 hover:text-stone-600 shrink-0 mt-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
