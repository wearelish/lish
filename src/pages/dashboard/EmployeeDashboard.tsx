import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashShell, StatusBadge } from "@/components/lish/DashShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, Clock, Wallet, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [wOpen, setWOpen] = useState(false);
  const [wForm, setWForm] = useState({ amount: "", method: "" });
  const [github, setGithub] = useState("");

  const load = async () => {
    const { data: t } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks(t ?? []);
    const { data: a } = await supabase.from("attendance").select("*").order("checked_in_at", { ascending: false });
    setAttendance(a ?? []);
    const { data: w } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
    setWithdrawals(w ?? []);
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
    setProfile(p);
    setGithub(p?.github_username ?? "");
    const { data: r } = await supabase.from("service_requests").select("*").eq("assigned_employee_id", user!.id);
    setRequests(r ?? []);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const checkIn = async () => {
    const { error } = await supabase.from("attendance").insert({ employee_id: user!.id });
    if (error) {
      if (error.code === "23505") return toast.error("Already checked in today");
      return toast.error(error.message);
    }
    toast.success("Checked in!");
    load();
  };

  const updateTask = async (id: string, status: string) => {
    await supabase.from("tasks").update({ status: status as any }).eq("id", id);
    load();
  };

  const earnings = requests.reduce((s, r) => {
    if (!r.final_price) return s;
    if (r.final_paid) return s + Number(r.final_price) * 0.6; // employee share, simple model
    if (r.upfront_paid) return s + Number(r.final_price) * 0.2;
    return s;
  }, 0);

  const requestWithdrawal = async () => {
    if (!wForm.amount) return toast.error("Amount required");
    const { error } = await supabase.from("withdrawals").insert({
      employee_id: user!.id, amount: Number(wForm.amount), upi_or_method: wForm.method,
    });
    if (error) return toast.error(error.message);
    toast.success("Withdrawal requested");
    setWOpen(false); setWForm({ amount: "", method: "" }); load();
  };

  const saveGithub = async () => {
    await supabase.from("profiles").update({ github_username: github }).eq("id", user!.id);
    toast.success("GitHub linked");
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = attendance.some((a) => a.check_in_date === today);

  return (
    <DashShell title={`Hello, ${profile?.full_name || "team"} 👋`} subtitle={`Employee ID: ${profile?.employee_code ?? "—"}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-strong rounded-3xl p-5">
          <Clock className="w-5 h-5 text-primary" />
          <div className="font-serif text-3xl mt-2">{attendance.length}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Days present</div>
        </div>
        <div className="glass-strong rounded-3xl p-5">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <div className="font-serif text-3xl mt-2">{tasks.filter((t) => t.status === "done").length}/{tasks.length}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Tasks done</div>
        </div>
        <div className="glass-strong rounded-3xl p-5">
          <Wallet className="w-5 h-5 text-primary" />
          <div className="font-serif text-3xl mt-2">₹{earnings.toFixed(0)}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Earned</div>
        </div>
        <button onClick={checkIn} disabled={checkedToday} className="glass-strong rounded-3xl p-5 text-left hover:shadow-[var(--shadow-glow)] transition-all disabled:opacity-50">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <div className="font-serif text-xl mt-2">{checkedToday ? "Checked ✓" : "Check in"}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Today</div>
        </button>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="bg-secondary rounded-full">
          <TabsTrigger value="tasks" className="rounded-full">Tasks</TabsTrigger>
          <TabsTrigger value="github" className="rounded-full">GitHub</TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-full">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          {tasks.length === 0 ? <p className="text-muted-foreground">No tasks assigned yet.</p> : (
            <div className="space-y-3">
              {tasks.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass-strong rounded-3xl p-5 flex justify-between items-center gap-4">
                  <div>
                    <p className="font-serif text-lg">{t.title}</p>
                    {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    {t.status !== "done" && (
                      <Button size="sm" className="rounded-full" onClick={() => updateTask(t.id, t.status === "todo" ? "in_progress" : "done")}>
                        {t.status === "todo" ? "Start" : "Mark done"}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <div className="glass-strong rounded-3xl p-6 max-w-md">
            <h3 className="font-serif text-xl flex items-center gap-2"><Github className="w-5 h-5" /> GitHub account</h3>
            <p className="text-sm text-muted-foreground mt-1">Link your GitHub username so admin can track commit activity.</p>
            <div className="flex gap-2 mt-4">
              <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="your-github-username" />
              <Button onClick={saveGithub} className="rounded-full">Save</Button>
            </div>
            {profile?.github_username && (
              <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="block mt-3 text-sm text-primary">
                View github.com/{profile.github_username} →
              </a>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-muted-foreground">Withdrawals are processed monthly after admin approval.</p>
            <Dialog open={wOpen} onOpenChange={setWOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0">Request payout</Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader><DialogTitle className="font-serif text-2xl">Request withdrawal</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" value={wForm.amount} onChange={(e) => setWForm({ ...wForm, amount: e.target.value })} /></div>
                  <div className="space-y-2"><Label>UPI / Method</Label><Input placeholder="you@upi or Paytm number" value={wForm.method} onChange={(e) => setWForm({ ...wForm, method: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={requestWithdrawal} className="rounded-full">Submit</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="glass rounded-3xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-serif text-lg">₹{w.amount}</p>
                  <p className="text-xs text-muted-foreground">{w.upi_or_method} · {new Date(w.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={w.status} />
              </div>
            ))}
            {withdrawals.length === 0 && <p className="text-muted-foreground text-center py-6">No payouts requested yet.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </DashShell>
  );
}