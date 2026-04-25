import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const db = supabase as any;

interface Props {
  checkedIn: boolean;
  onCheckedIn: () => void;
  today: string;
}

export const EPAttendance = ({ checkedIn, onCheckedIn, today }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [justMarked, setJustMarked] = useState(false);

  const markAttendance = async () => {
    if (!user?.id || checkedIn) return;
    setLoading(true);
    const { error } = await db.from("attendance").insert({
      employee_id: user.id,
      check_in_date: today,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("Already marked for today");
        onCheckedIn();
        return;
      }
      toast.error(error.message);
      return;
    }
    setJustMarked(true);
    setTimeout(() => setJustMarked(false), 3000);
    onCheckedIn();
    toast.success("Attendance marked!");
  };

  const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 flex items-center justify-between gap-4 mb-2 transition-all ${
        checkedIn
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${checkedIn ? "bg-emerald-100" : "bg-amber-100"}`}>
          {checkedIn ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <CalendarCheck className="w-5 h-5 text-amber-600" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">
            {checkedIn ? "Attendance Marked ✅" : "Mark Today's Attendance"}
          </p>
          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {today} · {timeNow}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {checkedIn ? (
          <motion.span key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full">
            ✓ Checked In
          </motion.span>
        ) : (
          <motion.div key="btn" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Button onClick={markAttendance} disabled={loading}
              className="rounded-full bg-amber-500 hover:bg-amber-600 text-white border-0 h-9 px-5 text-sm font-medium">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Marking…
                </span>
              ) : "Mark Attendance"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
