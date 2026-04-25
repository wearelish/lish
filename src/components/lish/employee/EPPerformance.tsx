import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react";

const db = supabase as any;

const ProgressBar = ({ value, color = "bg-primary" }: { value: number; color?: string }) => (
  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
      className={`h-full rounded-full ${color}`} />
  </div>
);

export const EPPerformance = ({ checkedIn: _ }: { checkedIn: boolean }) => {
  const { user } = useAuth();
  const uid = user?.id;

  const { data: tasks = [] } = useQuery({
    queryKey: ["ep-perf-tasks", uid],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").eq("employee_id", uid!);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["ep-perf-att", uid],
    queryFn: async () => {
      const { data } = await db.from("attendance").select("check_in_date").eq("employee_id", uid!);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const total = tasks.length;
  const done = tasks.filter((t: any) => t.status === "done").length;
  const inProgress = tasks.filter((t: any) => t.status === "in_progress").length;
  const todo = tasks.filter((t: any) => t.status === "todo").length;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // On-time: completed before or on deadline
  const onTime = tasks.filter((t: any) => {
    if (t.status !== "done" || !t.deadline || !t.completed_at) return false;
    return new Date(t.completed_at) <= new Date(t.deadline);
  }).length;
  const onTimeRate = done > 0 ? Math.round((onTime / done) * 100) : 0;

  // Attendance rate: days attended in last 30 days
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });
  const attendedDays = attendance.filter((a: any) => last30.includes(a.check_in_date)).length;
  const attendanceRate = Math.round((attendedDays / 30) * 100);

  const metrics = [
    { icon: CheckCircle2, label: "Tasks Completed", value: done, total, rate: completionRate, color: "bg-emerald-500", iconColor: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: Clock, label: "In Progress", value: inProgress, total, rate: total > 0 ? Math.round((inProgress / total) * 100) : 0, color: "bg-blue-500", iconColor: "text-blue-500", bg: "bg-blue-50" },
    { icon: Calendar, label: "Attendance (30d)", value: attendedDays, total: 30, rate: attendanceRate, color: "bg-primary", iconColor: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, label: "On-Time Rate", value: onTime, total: done, rate: onTimeRate, color: "bg-purple-500", iconColor: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Performance</h1>
        <p className="text-sm text-stone-500 mt-0.5">Your work metrics and progress overview.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon className={`w-4 h-4 ${m.iconColor}`} />
            </div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-stone-800">{m.value}</p>
                <p className="text-xs text-stone-500">{m.label}</p>
              </div>
              <p className="text-lg font-bold text-stone-400">{m.rate}%</p>
            </div>
            <ProgressBar value={m.rate} color={m.color} />
            <p className="text-[11px] text-stone-400 mt-1.5">{m.value} of {m.total}</p>
          </motion.div>
        ))}
      </div>

      {/* Task breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-stone-100 p-5">
        <h2 className="font-semibold text-stone-700 mb-4">Task Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: "Completed", value: done, color: "bg-emerald-500" },
            { label: "In Progress", value: inProgress, color: "bg-blue-500" },
            { label: "Not Started", value: todo, color: "bg-stone-300" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-xs text-stone-500 w-24 shrink-0">{s.label}</span>
              <div className="flex-1"><ProgressBar value={total > 0 ? (s.value / total) * 100 : 0} color={s.color} /></div>
              <span className="text-xs font-semibold text-stone-700 w-6 text-right">{s.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attendance calendar (last 14 days) */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl border border-stone-100 p-5">
        <h2 className="font-semibold text-stone-700 mb-4">Attendance — Last 14 Days</h2>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 14 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (13 - i));
            const dateStr = d.toISOString().split("T")[0];
            const present = attendance.some((a: any) => a.check_in_date === dateStr);
            return (
              <div key={dateStr} title={dateStr}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-semibold transition-all ${present ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-stone-400 border border-stone-200"}`}>
                {d.getDate()}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-400 mt-3">{attendedDays} days attended in last 30 days</p>
      </motion.div>
    </div>
  );
};
