import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Calendar, Clock, Activity } from "lucide-react";

const db = supabase as any;

export const EPActivity = ({ checkedIn: _ }: { checkedIn: boolean }) => {
  const { user } = useAuth();
  const uid = user?.id;

  const { data: tasks = [] } = useQuery({
    queryKey: ["ep-act-tasks", uid],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("id, title, status, updated_at, completed_at").eq("employee_id", uid!).order("updated_at", { ascending: false }).limit(20);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["ep-act-att", uid],
    queryFn: async () => {
      const { data } = await db.from("attendance").select("id, check_in_date, checked_in_at").eq("employee_id", uid!).order("check_in_date", { ascending: false }).limit(14);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const events = [
    ...tasks.map((t: any) => ({
      id: t.id + "-task",
      icon: t.status === "done" ? CheckCircle2 : Clock,
      color: t.status === "done" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500",
      title: t.title,
      desc: t.status === "done" ? "Task completed" : t.status === "in_progress" ? "Task started" : "Task assigned",
      time: t.completed_at ?? t.updated_at,
    })),
    ...attendance.map((a: any) => ({
      id: a.id + "-att",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
      title: "Attendance marked",
      desc: `Checked in on ${a.check_in_date}`,
      time: a.checked_in_at,
    })),
  ].sort((a, b) => {
    const ta = a.time ? new Date(a.time).getTime() : 0;
    const tb = b.time ? new Date(b.time).getTime() : 0;
    return tb - ta;
  }).slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Activity Log</h1>
        <p className="text-sm text-stone-500 mt-0.5">Your recent actions and work history.</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center">
          <Activity className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No activity yet. Start working to see your log here.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-100" />
          <div className="space-y-3 pl-12">
            {events.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="relative">
                <div className={`absolute -left-8 w-7 h-7 rounded-full ${e.color} flex items-center justify-center`}>
                  <e.icon className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-4">
                  <p className="font-medium text-sm text-stone-800">{e.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{e.desc}</p>
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    {e.time ? new Date(e.time).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
