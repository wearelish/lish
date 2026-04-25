import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckSquare, Clock, AlertTriangle, Play, CheckCircle2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

type TaskStatus = "todo" | "in_progress" | "done";

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  todo: { label: "Not Started", color: "text-stone-500", bg: "bg-stone-100", border: "border-stone-200" },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  done: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

export const EPTasks = ({ checkedIn }: { checkedIn: boolean }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["ep-tasks", uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, service_requests(title)")
        .eq("employee_id", uid!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const updateStatus = async (id: string, status: TaskStatus) => {
    if (!checkedIn) { toast.warning("Mark attendance first to update tasks"); return; }
    const updates: any = { status };
    if (status === "done") updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "done" ? "Task completed! 🎉" : "Task started");
    qc.invalidateQueries({ queryKey: ["ep-tasks", uid] });
  };

  const todo = tasks.filter((t: any) => t.status === "todo");
  const inProgress = tasks.filter((t: any) => t.status === "in_progress");
  const done = tasks.filter((t: any) => t.status === "done");

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Assigned Work</h1>
        <p className="text-sm text-stone-500 mt-0.5">Tasks assigned by admin. Focus and execute.</p>
      </div>

      {!checkedIn && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">Mark your attendance above to start working on tasks.</p>
        </motion.div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center">
          <Inbox className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No tasks assigned yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> In Progress ({inProgress.length})
              </h2>
              <div className="space-y-3">
                {inProgress.map((t: any, i: number) => <TaskCard key={t.id} task={t} i={i} onUpdate={updateStatus} checkedIn={checkedIn} />)}
              </div>
            </div>
          )}

          {/* To Do */}
          {todo.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-400 inline-block" /> To Do ({todo.length})
              </h2>
              <div className="space-y-3">
                {todo.map((t: any, i: number) => <TaskCard key={t.id} task={t} i={i} onUpdate={updateStatus} checkedIn={checkedIn} />)}
              </div>
            </div>
          )}

          {/* Done */}
          {done.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Completed ({done.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {done.map((t: any, i: number) => <TaskCard key={t.id} task={t} i={i} onUpdate={updateStatus} checkedIn={checkedIn} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task: t, i, onUpdate, checkedIn }: { task: any; i: number; onUpdate: (id: string, s: TaskStatus) => void; checkedIn: boolean }) => {
  const cfg = STATUS_CONFIG[t.status as TaskStatus] ?? STATUS_CONFIG.todo;
  const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== "done";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className={`bg-white rounded-2xl border ${isOverdue ? "border-red-200" : "border-stone-100"} p-5 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {cfg.label}
            </span>
            {isOverdue && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold bg-red-50 text-red-600 border border-red-200">Overdue</span>}
          </div>
          <h3 className="font-semibold text-stone-800 text-sm">{t.title}</h3>
          {t.description && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{t.description}</p>}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {t.service_requests?.title && (
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <CheckSquare className="w-3 h-3" /> {t.service_requests.title}
              </span>
            )}
            {t.deadline && (
              <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-stone-400"}`}>
                <Clock className="w-3 h-3" /> {new Date(t.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          {t.status === "todo" && (
            <Button onClick={() => onUpdate(t.id, "in_progress")} disabled={!checkedIn} size="sm"
              className="h-8 px-3 rounded-xl bg-blue-500 text-white border-0 text-xs gap-1 hover:bg-blue-600">
              <Play className="w-3 h-3" /> Start
            </Button>
          )}
          {t.status === "in_progress" && (
            <Button onClick={() => onUpdate(t.id, "done")} disabled={!checkedIn} size="sm"
              className="h-8 px-3 rounded-xl bg-emerald-500 text-white border-0 text-xs gap-1 hover:bg-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Complete
            </Button>
          )}
          {t.status === "done" && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
