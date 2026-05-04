import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckSquare, Clock, AlertTriangle, Play, CheckCircle2, Inbox, FileText, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type TaskStatus = "todo" | "in_progress" | "done";

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  todo:        { label: "Not Started", color: "text-stone-500",   bg: "bg-stone-100", border: "border-stone-200" },
  in_progress: { label: "In Progress", color: "text-blue-600",    bg: "bg-blue-50",   border: "border-blue-200" },
  done:        { label: "Completed",   color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
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
        .select("*, service_requests(title, scope_of_work, delivery_file_url)")
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
    qc.invalidateQueries({ queryKey: ["ep-perf-tasks", uid] });
    qc.invalidateQueries({ queryKey: ["ep-act-tasks", uid] });
    qc.invalidateQueries({ queryKey: ["ad-emp-tasks"] });
  };

  const todo = tasks.filter((t: any) => t.status === "todo");
  const inProgress = tasks.filter((t: any) => t.status === "in_progress");
  const done = tasks.filter((t: any) => t.status === "done");

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

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
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> In Progress ({inProgress.length})
              </h2>
              <div className="space-y-3">
                {inProgress.map((t: any, i: number) => (
                  <TaskCard key={t.id} task={t} i={i} onUpdate={updateStatus} checkedIn={checkedIn} uid={uid!} qc={qc} />
                ))}
              </div>
            </div>
          )}

          {todo.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-400 inline-block" /> To Do ({todo.length})
              </h2>
              <div className="space-y-3">
                {todo.map((t: any, i: number) => (
                  <TaskCard key={t.id} task={t} i={i} onUpdate={updateStatus} checkedIn={checkedIn} uid={uid!} qc={qc} />
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Completed ({done.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {done.map((t: any, i: number) => (
                  <TaskCard key={t.id} task={t} i={i} onUpdate={updateStatus} checkedIn={checkedIn} uid={uid!} qc={qc} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({
  task: t, i, onUpdate, checkedIn, uid, qc,
}: {
  task: any; i: number;
  onUpdate: (id: string, s: TaskStatus) => Promise<void>;
  checkedIn: boolean; uid: string; qc: any;
}) => {
  const cfg = STATUS_CONFIG[t.status as TaskStatus] ?? STATUS_CONFIG.todo;
  const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== "done";
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(t.progress_note ?? "");
  const [savingNote, setSavingNote] = useState(false);

  const saveNote = async () => {
    setSavingNote(true);
    const { error } = await supabase.from("tasks").update({ progress_note: note } as any).eq("id", t.id);
    setSavingNote(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Progress note saved");
    qc.invalidateQueries({ queryKey: ["ep-tasks", uid] });
    qc.invalidateQueries({ queryKey: ["ad-emp-tasks"] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className={`bg-white rounded-2xl border ${isOverdue ? "border-red-200" : "border-stone-100"} overflow-hidden`}>

      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
              </span>
              {isOverdue && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold bg-red-50 text-red-600 border border-red-200">
                  Overdue
                </span>
              )}
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
                  <Clock className="w-3 h-3" /> Due {new Date(t.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0 items-end">
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
            <button onClick={() => setExpanded(e => !e)}
              className="text-[11px] text-stone-400 flex items-center gap-0.5 hover:text-stone-600 transition-colors mt-1">
              Details {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded: scope, files, progress note */}
      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
          className="border-t border-stone-100 p-5 space-y-4 bg-stone-50/50">

          {/* Scope of work */}
          {t.service_requests?.scope_of_work && (
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Scope of Work
              </p>
              <p className="text-xs text-stone-700 leading-relaxed bg-white rounded-xl p-3 border border-stone-100">
                {t.service_requests.scope_of_work}
              </p>
            </div>
          )}

          {/* Delivery files (read-only link from admin) */}
          {t.service_requests?.delivery_file_url && (
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Reference Files</p>
              <a href={t.service_requests.delivery_file_url} target="_blank" rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1">
                <FileText className="w-3 h-3" /> View project files
              </a>
            </div>
          )}

          {/* Progress note */}
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Progress Update
            </p>
            <Textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a progress note for admin (e.g. completed homepage, working on checkout…)"
              className="rounded-xl resize-none text-xs bg-white"
            />
            <Button onClick={saveNote} disabled={savingNote || !note.trim()} size="sm"
              className="mt-2 h-8 px-4 rounded-xl bg-stone-800 text-white border-0 text-xs">
              {savingNote ? "Saving…" : "Save Note"}
            </Button>
            {t.progress_note && (
              <p className="text-[11px] text-stone-400 mt-1.5 italic">Last saved: "{t.progress_note}"</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
