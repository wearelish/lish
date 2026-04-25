import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

const STATUSES = ["accepted", "in_progress", "completed", "cancelled"];

export const ADProjects = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [deadline, setDeadline] = useState("");
  const [assignTo, setAssignTo] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["ad-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_requests")
        .select("*").in("status", ["accepted", "in_progress", "completed", "cancelled"] as any).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["ad-employees-list"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "employee");
      if (!roles?.length) return [];
      const ids = roles.map((r: any) => r.user_id);
      const { data } = await supabase.from("profiles").select("id, full_name, email, employee_code").in("id", ids);
      return data ?? [];
    },
  });

  const save = async (id: string) => {
    const updates: any = {};
    if (deadline) updates.deadline = deadline;
    if (assignTo) updates.assigned_employee_id = assignTo;
    if (!Object.keys(updates).length) { setEditing(null); return; }
    const { error } = await supabase.from("service_requests").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project updated");
    setEditing(null); setDeadline(""); setAssignTo("");
    qc.invalidateQueries({ queryKey: ["ad-projects"] });
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("service_requests").update({ status } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Status → ${status}`);
    qc.invalidateQueries({ queryKey: ["ad-projects"] });
  };

  const filtered = filter === "all" ? projects : projects.filter((p: any) => p.status === filter);

  return (
    <div>
      <SectionHeader title="Project Management" subtitle={`${projects.length} accepted projects`} />

      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...STATUSES].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Table headers={["Title", "Status", "Assigned To", "Deadline", "Final Price", "Actions"]} empty={filtered.length === 0}>
        {filtered.map((p: any) => {
          const emp = employees.find((e: any) => e.id === p.assigned_employee_id);
          return (
            <TR key={p.id}>
              <TD><p className="font-medium max-w-[160px] truncate">{p.title}</p></TD>
              <TD>{statusBadge(p.status)}</TD>
              <TD className="text-xs">{emp ? (emp.full_name || emp.email) : <span className="text-stone-400">Unassigned</span>}</TD>
              <TD className="text-xs">{p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}</TD>
              <TD className="text-xs font-medium">{p.final_price ? `$${Number(p.final_price).toLocaleString()}` : "—"}</TD>
              <TD>
                {editing === p.id ? (
                  <div className="flex gap-1.5 items-center flex-wrap">
                    <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="h-7 text-xs rounded-lg w-32" />
                    <Select value={assignTo} onValueChange={setAssignTo}>
                      <SelectTrigger className="h-7 text-xs rounded-lg w-36"><SelectValue placeholder="Assign…" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.full_name || e.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={v => setStatus(p.id, v)}>
                      <SelectTrigger className="h-7 text-xs rounded-lg w-32"><SelectValue placeholder="Status…" /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => save(p.id)} size="sm" className="h-7 px-2 rounded-lg bg-emerald-500 text-white border-0 text-xs">Save</Button>
                    <Button onClick={() => setEditing(null)} size="sm" variant="ghost" className="h-7 px-2 rounded-lg text-xs">Cancel</Button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(p.id); setDeadline(p.deadline ?? ""); setAssignTo(p.assigned_employee_id ?? ""); }}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-all">
                    Edit
                  </button>
                )}
              </TD>
            </TR>
          );
        })}
      </Table>
    </div>
  );
};
