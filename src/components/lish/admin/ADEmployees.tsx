import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

export const ADEmployees = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", code: "" });
  const [saving, setSaving] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskReq, setTaskReq] = useState("");

  const { data: employees = [] } = useQuery({
    queryKey: ["ad-employees-full"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "employee");
      if (!roles?.length) return [];
      const { data } = await supabase.from("profiles").select("*").in("id", roles.map((r: any) => r.user_id));
      return data ?? [];
    },
  });

  const { data: empTasks = [] } = useQuery({
    queryKey: ["ad-emp-tasks", active?.id],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*, service_requests(title)").eq("employee_id", active!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!active?.id,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["ad-req-for-task"],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("id,title").in("status", ["price_sent", "in_progress"] as any);
      return data ?? [];
    },
  });

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.fullName || !form.code) { toast.error("All fields required"); return; }
    setSaving(true);
    const { data: { session: adminSession } } = await supabase.auth.getSession();
    if (!adminSession) { setSaving(false); toast.error("Admin session lost. Please log in again."); return; }
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.fullName } } });
    if (error || !data.user) {
      setSaving(false); toast.error(error?.message ?? "Signup failed");
      await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
      return;
    }
    const uid = data.user.id;
    await supabase.from("user_roles").delete().eq("user_id", uid);
    await supabase.from("user_roles").insert({ user_id: uid, role: "employee" });
    await supabase.from("profiles").update({ employee_code: form.code, full_name: form.fullName } as any).eq("id", uid);
    await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
    setSaving(false);
    toast.success(`Employee created — ID: ${form.code}`);
    setForm({ email: "", password: "", fullName: "", code: "" });
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ["ad-employees-full"] });
  };

  const assignTask = async () => {
    if (!active || !taskTitle || !taskReq) { toast.error("Fill task title and project"); return; }
    const { error } = await supabase.from("tasks").insert({ employee_id: active.id, request_id: taskReq, title: taskTitle });
    if (error) { toast.error(error.message); return; }
    toast.success("Task assigned");
    setTaskTitle(""); setTaskReq("");
    qc.invalidateQueries({ queryKey: ["ad-emp-tasks", active.id] });
    qc.invalidateQueries({ queryKey: ["ep-tasks"] });
  };

  return (
    <div>
      <SectionHeader title="Employee Management" subtitle={`${employees.length} employees`}
        action={<Button onClick={() => setShowForm(true)} className="rounded-xl bg-rose-500 text-white border-0 gap-2 h-9 text-sm"><UserPlus className="w-4 h-4" /> Add Employee</Button>} />

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-stone-800">Add New Employee</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-stone-400" /></button></div>
            <form onSubmit={addEmployee} className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">Full Name</Label><Input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="rounded-xl h-10" /></div>
              <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="rounded-xl h-10" /></div>
              <div className="space-y-1"><Label className="text-xs">Password</Label><Input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="rounded-xl h-10" /></div>
              <div className="space-y-1"><Label className="text-xs">Employee ID (e.g. LISH-001)</Label><Input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="LISH-001" className="rounded-xl h-10 font-mono" /></div>
              <Button type="submit" disabled={saving} className="w-full rounded-xl bg-rose-500 text-white border-0 h-10">{saving ? "Creating…" : "Create Employee"}</Button>
            </form>
          </div>
        </div>
      )}

      <Table headers={["Name", "Email", "Employee ID", "Actions"]} empty={employees.length === 0}>
        {employees.map((e: any) => (
          <TR key={e.id}>
            <TD><p className="font-medium">{e.full_name || "—"}</p></TD>
            <TD className="text-xs text-stone-400">{e.email}</TD>
            <TD><span className="font-mono text-xs bg-stone-100 px-2 py-0.5 rounded">{e.employee_code || "—"}</span></TD>
            <TD><button onClick={() => setActive(e)} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-all">View</button></TD>
          </TR>
        ))}
      </Table>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white z-10">
              <div><h2 className="font-bold text-stone-800">{active.full_name || active.email}</h2><p className="text-xs text-stone-400 font-mono">{active.employee_code}</p></div>
              <button onClick={() => setActive(null)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Assign Task</p>
                <div className="flex gap-2 flex-wrap">
                  <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title" className="rounded-xl h-9 text-sm flex-1 min-w-[140px]" />
                  <Select value={taskReq} onValueChange={setTaskReq}>
                    <SelectTrigger className="rounded-xl h-9 text-sm w-44"><SelectValue placeholder="Project…" /></SelectTrigger>
                    <SelectContent>{requests.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button onClick={assignTask} size="sm" className="rounded-xl bg-rose-500 text-white border-0 h-9 px-3">Assign</Button>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Tasks ({empTasks.length})</p>
                {empTasks.length === 0 ? <p className="text-xs text-stone-400">No tasks assigned.</p> : (
                  <div className="space-y-2">
                    {empTasks.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2">
                        <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-stone-400">{(t as any).service_requests?.title}</p></div>
                        {statusBadge(t.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
