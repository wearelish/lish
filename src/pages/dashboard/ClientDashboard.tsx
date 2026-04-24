import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashShell, StatusBadge } from "@/components/lish/DashShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, MessageSquare, IndianRupee, Calendar } from "lucide-react";
import { motion } from "framer-motion";

type Req = {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  deadline: string | null;
  status: string;
  final_price: number | null;
  upfront_paid: boolean;
  final_paid: boolean;
  created_at: string;
};
type Negotiation = { id: string; actor: "client" | "admin"; proposed_price: number; message: string | null; created_at: string };
type Message = { id: string; sender_id: string; body: string; created_at: string };

export default function ClientDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Req[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Req | null>(null);
  const [negs, setNegs] = useState<Negotiation[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [counter, setCounter] = useState("");
  const [counterMsg, setCounterMsg] = useState("");
  const [chat, setChat] = useState("");

  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "" });

  const load = async () => {
    const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    setRequests((data as Req[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (r: Req) => {
    setActive(r);
    const { data: n } = await supabase.from("negotiations").select("*").eq("request_id", r.id).order("created_at");
    setNegs((n as Negotiation[]) ?? []);
    const { data: m } = await supabase.from("messages").select("*").eq("request_id", r.id).order("created_at");
    setMsgs((m as Message[]) ?? []);
  };

  const submit = async () => {
    if (!form.title || !form.description) return toast.error("Title & description required");
    const { error } = await supabase.from("service_requests").insert({
      client_id: user!.id,
      title: form.title,
      description: form.description,
      budget: form.budget ? Number(form.budget) : null,
      deadline: form.deadline || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Request submitted!");
    setOpen(false);
    setForm({ title: "", description: "", budget: "", deadline: "" });
    load();
  };

  const counterOffer = async () => {
    if (!active || !counter) return;
    if (negs.length >= 6) return toast.error("Negotiation limit reached");
    const { error } = await supabase.from("negotiations").insert({
      request_id: active.id,
      actor: "client",
      proposed_price: Number(counter),
      message: counterMsg || null,
    });
    if (error) return toast.error(error.message);
    setCounter(""); setCounterMsg("");
    openDetail(active);
  };

  const acceptFinal = async () => {
    if (!active) return;
    const { error } = await supabase.from("service_requests").update({ status: "accepted" }).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Project accepted! Pay 40% to start.");
    openDetail({ ...active, status: "accepted" });
    load();
  };

  const sendChat = async () => {
    if (!active || !chat.trim()) return;
    const { error } = await supabase.from("messages").insert({
      request_id: active.id,
      sender_id: user!.id,
      body: chat.trim(),
    });
    if (error) return toast.error(error.message);
    setChat("");
    openDetail(active);
  };

  const markPaid = async (which: "upfront" | "final") => {
    if (!active) return;
    const patch = which === "upfront" ? { upfront_paid: true, status: "in_progress" as const } : { final_paid: true };
    const { error } = await supabase.from("service_requests").update(patch).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded — admin will verify.");
    openDetail({ ...active, ...patch });
    load();
  };

  return (
    <DashShell title="Your projects" subtitle="Submit requests, negotiate and track delivery.">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{requests.length} request{requests.length !== 1 && "s"}</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0">
              <Plus className="w-4 h-4 mr-1" /> New request
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">New service request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Describe your project</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Budget (₹/$)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
                <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit} className="rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0">Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {requests.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <p className="text-muted-foreground">No requests yet — start your first project!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {requests.map((r, i) => (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              onClick={() => openDetail(r)}
              className="glass-strong rounded-3xl p-6 text-left transition-all"
            >
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-serif text-xl">{r.title}</h3>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.description}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                {r.budget && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{r.budget}</span>}
                {r.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.deadline}</span>}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl flex items-center gap-3">
                  {active.title} <StatusBadge status={active.status} />
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{active.description}</p>

              {/* Negotiations */}
              <div className="mt-2">
                <h4 className="font-medium text-sm mb-2">Pricing</h4>
                {negs.length === 0 && <p className="text-xs text-muted-foreground">Waiting for admin response.</p>}
                <div className="space-y-2">
                  {negs.map((n) => (
                    <div key={n.id} className={`rounded-2xl p-3 text-sm ${n.actor === "admin" ? "bg-secondary" : "bg-accent"}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{n.actor}</span>
                        <span className="font-serif text-lg">₹{n.proposed_price}</span>
                      </div>
                      {n.message && <p className="text-xs text-muted-foreground mt-1">{n.message}</p>}
                    </div>
                  ))}
                </div>

                {active.status === "negotiating" && negs.length < 6 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Your counter offer" type="number" value={counter} onChange={(e) => setCounter(e.target.value)} />
                      <Button onClick={counterOffer} className="rounded-full">Send</Button>
                    </div>
                    <Input placeholder="Optional note" value={counterMsg} onChange={(e) => setCounterMsg(e.target.value)} />
                  </div>
                )}

                {active.final_price && active.status === "negotiating" && (
                  <Button onClick={acceptFinal} className="w-full mt-3 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0">
                    Accept final price ₹{active.final_price}
                  </Button>
                )}
              </div>

              {/* Payments */}
              {(active.status === "accepted" || active.status === "in_progress" || active.status === "completed") && active.final_price && (
                <div className="mt-4 glass rounded-2xl p-4">
                  <h4 className="font-medium text-sm mb-3">Payments</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">40% upfront</p>
                      <p className="font-serif text-lg">₹{(active.final_price * 0.4).toFixed(0)}</p>
                      {active.upfront_paid ? <span className="text-emerald-700 text-xs">✓ Paid</span> : (
                        <Button size="sm" className="mt-1 rounded-full" onClick={() => markPaid("upfront")}>Mark paid</Button>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">60% on delivery</p>
                      <p className="font-serif text-lg">₹{(active.final_price * 0.6).toFixed(0)}</p>
                      {active.final_paid ? <span className="text-emerald-700 text-xs">✓ Paid</span> : (
                        <Button size="sm" disabled={!active.upfront_paid} className="mt-1 rounded-full" onClick={() => markPaid("final")}>Mark paid</Button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">UPI: <span className="font-mono">lish@upi</span> · Stripe links coming soon.</p>
                </div>
              )}

              {/* Chat */}
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Messages</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {msgs.map((m) => (
                    <div key={m.id} className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] ${m.sender_id === user?.id ? "bg-primary text-primary-foreground ml-auto" : "bg-secondary"}`}>
                      {m.body}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Message admin..." />
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