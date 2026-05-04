import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Clock } from "lucide-react";

export const EPAttendance = ({ checkedIn, onCheckedIn, today }: { checkedIn: boolean; onCheckedIn: () => void; today: string }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkIn = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { error } = await (supabase as any).from("attendance").insert({ employee_id: user.id, check_in_date: today });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) { toast.error(error.message); return; }
    toast.success("Attendance marked! Have a productive day 🎯");
    onCheckedIn();
  };

  return (
    <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 mb-4 ${checkedIn ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
      <div className="flex items-center gap-3">
        {checkedIn ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <Clock className="w-5 h-5 text-amber-500 shrink-0" />}
        <div>
          <p className={`text-sm font-semibold ${checkedIn ? "text-emerald-800" : "text-amber-800"}`}>{checkedIn ? "Attendance marked for today" : "Mark your attendance"}</p>
          <p className={`text-xs mt-0.5 ${checkedIn ? "text-emerald-600" : "text-amber-600"}`}>{today}</p>
        </div>
      </div>
      {!checkedIn && (
        <Button onClick={checkIn} disabled={loading} size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0 h-9 px-4 text-xs shrink-0">
          {loading ? "Marking…" : "Check In"}
        </Button>
      )}
    </div>
  );
};
