import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckSquare, Clock, CalendarCheck } from "lucide-react";

const taskColor: Record<string, string> = {
  todo: "bg-secondary text-secondary-foreground",
  in_progress: "bg-primary text-primary-foreground",
  done: "bg-emerald-100 text-emerald-700",
};

export const EmployeeDash = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["emp-tasks", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*, service_requests(title)").eq("employee_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["emp-attendance", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("*").eq("employee_id", user!.id).order("check_in_date", { ascending: false }).limit(7);
      return data ?? [];
    },
    enabled: !!user,
  });

  const checkedInToday = attendance.some((a: any) => a.check_in_date === new Date().toISOString().split("T")[0]);

  const checkIn = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("attendance").insert({ employee_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Checked in!"); qc.invalidateQueries({ queryKey: ["emp-attendance"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const todo = tasks.filter((t: any) => t.status === "todo").length;
  const inProgress = tasks.filter((t: any) => t.status === "in_progress").length;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs uppercase tracking-widest text-primary font-medium">Employee Portal</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-gradient mt-1">Hey, {name} 👋</h1>
        <p className="text-muted-foreground mt-2 text-sm">Here are your tasks and attendance.</p>
      </motion.div>

      {/* Quick stats + check-in */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        <div className="glass-strong rounded-2xl p-5">
          <CheckSquare className="w-5 h-5 text-primary mb-3" />
          <div className="font-serif text-3xl font-semibold text-gradient">{todo}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">To Do</div>
        </div>
        <div className="glass-strong rounded-2xl p-5">
          <Clock className="w-5 h-5 text-primary mb-3" />
          <div className="font-serif text-3xl font-semibold text-gradient">{inProgress}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">In Progress</div>
        </div>
        <div className="glass-strong rounded-2xl p-5 col-span-2 sm:col-span-1 flex flex-col justify-between">
          <CalendarCheck className="w-5 h-5 text-primary mb-3" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Today's Attendance</div>
            <Button
              size="sm"
              disabled={checkedInToday || checkIn.isPending}
              onClick={() => checkIn.mutate()}
              className="rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white border-0 w-full"
            >
              {checkedInToday ? "✓ Checked In" : checkIn.isPending ? "Checking in..." : "Check In"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tasks */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-3">
        <h2 className="font-serif text-xl text-foreground">Assigned Tasks</h2>
        {tasks.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <CheckSquare className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No tasks assigned yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t: any, i: number) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-strong rounded-2xl p-5 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm">{t.title}</p>
                  {t.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{t.description}</p>}
                  {t.service_requests?.title && (
                    <p className="text-[11px] text-primary mt-1">Project: {t.service_requests.title}</p>
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium shrink-0 ${taskColor[t.status] ?? "bg-muted text-muted-foreground"}`}>
                  {t.status.replace("_", " ")}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
