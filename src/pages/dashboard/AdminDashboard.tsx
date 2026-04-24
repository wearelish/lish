import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashShell, StatusBadge } from "@/components/lish/DashShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserPlus, Users, FileText, Wallet } from "lucide-react";

type Req = any;
type Profile = { id: string; full_name: string | null; email: string | null; employee_code: string | null };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Req[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [active, setActive] = useState<Req | null>(null);
  const [negs, setNegs] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [counter, setCounter] = useState("");
  const [counterMsg, setCounterMsg] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [assignTo, setAssignTo] = useState<string>("");
  const [chat, setChat] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  const [empOpen, setEmpOpen] = useState(false);
  const [empForm, setEmpForm] = useState({ email: "", password: "", fullName: "", code: "" });

  const load = async () => {
    const { data: r } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    setRequests(r ?? []);
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "employee");
    const ids = (roles ?? []).map((x) => x.user_id);
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
      setEmployees((profs as Profile[]) ?? []);
    } else setEmployees([]);
    const { data: w } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
    setWithdrawals(w ?? []);
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (r: Req) => {
    setActive(r);
    setFinalPrice(r.final_price?.toString() ?? "");
    setAssignTo(r.assigned_employee_id ?? "");
    const { data: n } = await supabase.from("negotiations").select("*").eq("request_id", r.id).order("created_at");
    setNegs(n ?? []);
    const { data: m } = await supabase.from("messages").select("*").eq("request_id", r.id).order("created_at");
    setMsgs(m ?? []);
  };

  const setStatus = async (s: string) => {
    if (!active) return;
    const { error } = await supabase.from("service_requests").update({ status: s as any }).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    openDetail({ ...active, status: s }); load();
  };

  const sendNeg = async () => {
    if (!active || !counter) return;
    if (negs.length >= 6) return toast.error("Negotiation limit reached (3 rounds)");
    const { error } = await supabase.from("negotiations").insert({
      request_id: active.id, actor: "admin", proposed_price: Number(counter), message: counterMsg || null,
    });
    if (error) return toast.error(error.message);
    if (active.status === "pending") await supabase.from("service_requests").update({ status: "negotiating" }).eq("id", active.id);
    setCounter(""); setCounterMsg("");
    openDetail({ ...active, status: "negotiating" }); load();
  };

  const lockFinal = async () => {
    if (!active || !finalPrice) return;
    const { error } = await supabase.from("service_requests").update({ final_price: Number(finalPrice) }).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Final price set — waiting for client to accept.");
    openDetail({ ...active, final_price: Number(finalPrice) }); load();
  };

  const assign = async () => {
    if (!active || !assignTo) return;
    const { error } = await supabase.from("service_requests").update({ assigned_employee_id: assignTo }).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Employee assigned");
    openDetail({ ...active, assigned_employee_id: assignTo }); load();
  };

  const createTask = async () => {
    if (!active || !active.assigned_employee_id || !taskTitle) return toast.error("Assign employee + title required");
    const { error } = await supabase.from("tasks").insert({
      request_id: active.id, employee_id: active.assigned_employee_id, title: taskTitle,
    });
    if (error) return toast.error(error.message);
    toast.success("Task created");
    setTaskTitle("");
  };

  const sendChat = async () => {
    if (!active || !chat.trim()) return;
    const { error } = await supabase.from("messages").insert({
      request_id: active.id, sender_id: user!.id, body: chat.trim(),
    });
    if (error) return toast.error(error.message);
    setChat(""); openDetail(active);
  };

  const createEmployee = async () => {
    if (!empForm.email || !empForm.password || !empForm.code) return toast.error("All fields required");
    // Sign up creates client by default; admin then promotes via user_roles + sets employee_code.
    const { data, error } = await supabase.auth.signUp({
      email: empForm.email, password: empForm.password,
      options: { data: { full_name: empForm.fullName } },
    });
    if (error) return toast.error(error.message);
    const uid = data.user?.id;
    if (!uid) return toast.error("Could not create user");
    await supabase.from("profiles").update({ employee_code: empForm.code, full_name: empForm.fullName }).eq("id", uid);
    await supabase.from("user_roles").insert({ user_id: uid, role: "employee" });
    toast.success(`Employee created with code ${empForm.code}`);
    setEmpForm({ email: "", password: "", fullName: "", code: "" });
    setEmpOpen(false);
    load();
  };

  const processWithdrawal = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("withdrawals").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
    toast.success(`Withdrawal ${status}`); load();
  };

  const totalRevenue = requests.reduce((s, r) => s + (r.final_paid ? Number(r.final_price ?? 0) : r.upfront_paid ? Number(r.final_price ?? 0) * 0.4 : 0), 0);

  return (
    <DashShell title="Admin control" subtitle="Manage requests, team and the entire pipeline.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { k: "Requests", v: requests.length, icon: FileText },
          { k: "Pending", v: requests.filter((r) => r.status === "pending").length, icon: FileText },
          { k: "Team", v: employees.length, icon: Users },
          { k: "Revenue", v: `₹${totalRevenue.toFixed(0)}`, icon: Wallet },
        ].map((s) => (
          <div key={s.k} className="glass-strong rounded-3xl p-5">
            <s.icon className="w-5 h-5 text-primary" />
            <div className="font-serif text-3xl mt-2">{s.v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.k}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-secondary rounded-full">
          <TabsTrigger value="requests" className="rounded-full">Requests</TabsTrigger>
          <TabsTrigger value="team" className="rounded-full">Team</TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-full">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          {requests.length === 0 ? <p className="text-muted-foreground">No requests yet.</p> : (
            <div className="grid sm:grid-cols-2 gap-5">
              {requests.map((r, i) => (
                <motion.button key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                  onClick={() => openDetail(r)} className="glass-strong rounded-3xl p-6 text-left">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-serif text-xl">{r.title}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.description}</p>
                  <div className="text-xs text-muted-foreground mt-3">Budget: ₹{r.budget ?? "—"} · Deadline: {r.deadline ?? "—"}</div>
                </motion.button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="flex justify-between mb-5">
            <p className="text-sm text-muted-foreground">{employees.length} employees</p>
            <Dialog open={empOpen} onOpenChange={setEmpOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0">
                  <UserPlus className="w-4 h-4 mr-1" /> Add employee
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader><DialogTitle className="font-serif text-2xl">New employee</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>Full name</Label><Input value={empForm.fullName} onChange={(e) => setEmpForm({ ...empForm, fullName: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Initial password</Label><Input type="password" value={empForm.password} onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Employee code</Label><Input placeholder="LISH-001" value={empForm.code} onChange={(e) => setEmpForm({ ...empForm, code: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={createEmployee} className="rounded-full">Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {employees.map((e) => (
              <div key={e.id} className="glass-strong rounded-3xl p-5">
                <div className="flex justify-between">
                  <div>
                    <p className="font-serif text-lg">{e.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{e.email}</p>
                  </div>
                  <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-full h-fit">{e.employee_code}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6">
          {withdrawals.length === 0 ? <p className="text-muted-foreground">No withdrawal requests.</p> : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="glass-strong rounded-3xl p-5 flex justify-between items-center">
                  <div>
                    <p className="font-serif text-xl">₹{w.amount}</p>
                    <p className="text-xs text-muted-foreground">{w.upi_or_method} · {new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={w.status} />
                    {w.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => processWithdrawal(w.id, "rejected")}>Reject</Button>
                        <Button size="sm" className="rounded-full" onClick={() => processWithdrawal(w.id, "approved")}>Approve</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl flex items-center gap-3">{active.title} <StatusBadge status={active.status} /></DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{active.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus("rejected")}>Reject</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus("completed")}>Mark completed</Button>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Negotiation ({Math.floor(negs.length / 2)} / 3 rounds)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {negs.map((n) => (
                    <div key={n.id} className={`rounded-2xl p-3 text-sm ${n.actor === "admin" ? "bg-primary/10" : "bg-accent"}`}>
                      <div className="flex justify-between"><span className="capitalize font-medium">{n.actor}</span><span className="font-serif text-lg">₹{n.proposed_price}</span></div>
                      {n.message && <p className="text-xs text-muted-foreground mt-1">{n.message}</p>}
                    </div>
                  ))}
                </div>
                {negs.length < 6 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Your offer" value={counter} onChange={(e) => setCounter(e.target.value)} />
                      <Button onClick={sendNeg} className="rounded-full">Send</Button>
                    </div>
                    <Input placeholder="Note" value={counterMsg} onChange={(e) => setCounterMsg(e.target.value)} />
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Input type="number" placeholder="Set final price" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} />
                  <Button onClick={lockFinal} className="rounded-full">Lock final</Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Assign employee</h4>
                <div className="flex gap-2">
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button onClick={assign} className="rounded-full">Assign</Button>
                </div>
                {active.assigned_employee_id && (
                  <div className="mt-3 flex gap-2">
                    <Input placeholder="Add task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                    <Button onClick={createTask} className="rounded-full">+ Task</Button>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Messages</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {msgs.map((m) => (
                    <div key={m.id} className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] ${m.sender_id === user?.id ? "bg-primary text-primary-foreground ml-auto" : "bg-secondary"}`}>{m.body}</div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Reply to client..." />
                  <Button onClick={sendChat} className="rounded-full">Send</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}