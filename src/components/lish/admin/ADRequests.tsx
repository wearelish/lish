import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X, Send, CheckCircle, XCircle } from "lucide-react";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

const STATUSES = ["pending", "accepted", "rejected", "in_progress", "completed", "cancelled"];

export const ADRequests = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const [active, setActive] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [finalPrice, setFinalPrice] = useState("");
  const [stripeLink, setStripeLink] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: requests = [] } = useQuery({
    queryKey: ["ad-requests-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
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

  const { data: msgs = [] } = useQuery({
    queryKey: ["ad-msgs", active?.id],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("request_id", active!.id).order("created_at");
      return data ?? [];
    },
    enabled: !!active?.id,
    refetchInterval: 4000,
  });

  const reload = () => {
    qc.invalidateQueries({ queryKey: ["ad-requests-full"] });
    qc.invalidateQueries({ queryKey: ["ad-msgs", active?.id] });
  };

  const setStatus = async (status: string) => {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase.from("service_requests").update({ status } as any).eq("id", active.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, status });
    reload();
    toast.success(`Status → ${status}`);
  };

  const savePrice = async () => {
    if (!active || !finalPrice) return;
    const updates: any = { final_price: Number(finalPrice) };
    if (stripeLink) updates.stripe_payment_link = stripeLink;
    const { error } = await supabase.from("service_requests").update(updates).eq("id", active.id);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, final_price: Number(finalPrice), stripe_payment_link: stripeLink });
    reload();
    toast.success("Price saved — client can now pay");
  };

  const assign = async () => {
    if (!active || !assignTo) return;
    const { error } = await supabase.from("service_requests").update({ assigned_employee_id: assignTo } as any).eq("id", active.id);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, assigned_employee_id: assignTo });
    reload();
    toast.success("Employee assigned");
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !active) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("messages").insert({ request_id: active.id, sender_id: user.id, body: chatMsg.trim() });
    if (error) { toast.error(error.message); return; }
    setChatMsg("");
    reload();
  };

  const quickAction = async (id: string, status: "accepted" | "rejected") => {
    const { error } = await supabase.from("service_requests").update({ status } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    reload();
    toast.success(status === "accepted" ? "Request accepted" : "Request rejected");
  };

  const filtered = filter === "all" ? requests : requests.filter((r: any) => r.status === filter);

  return (
    <div>
      <SectionHeader title="Request Management" subtitle={`${requests.length} total requests`} />

      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...STATUSES].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Table headers={["Title", "Budget", "Status", "Created", "Actions"]} empty={filtered.length === 0}>
        {filtered.map((r: any) => (
          <TR key={r.id}>
            <TD><p className="font-medium max-w-[200px] truncate">{r.title}</p></TD>
            <TD>{r.budget ? `$${Number(r.budget).toLocaleString()}` : "—"}</TD>
            <TD>{statusBadge(r.status)}</TD>
            <TD className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString()}</TD>
            <TD>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => { setActive(r); setFinalPrice(r.final_price?.toString() ?? ""); setAssignTo(r.assigned_employee_id ?? ""); setStripeLink((r as any).stripe_payment_link ?? ""); }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-all">
                  Open
                </button>
                {r.status === "pending" && (
                  <>
                    <button onClick={() => quickAction(r.id, "accepted")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition-all flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Accept
                    </button>
                    <button onClick={() => quickAction(r.id, "rejected")}
                      className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-all flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </>
                )}
              </div>
            </TD>
          </TR>
        ))}
      </Table>

      {/* Detail panel */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end p-4 overflow-y-auto">
            <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[95vh] overflow-y-auto">

              <div className="flex items-start justify-between gap-3 p-5 border-b border-stone-100 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="font-bold text-stone-800">{active.title}</h2>
                  <p className="text-xs text-stone-400 mt-0.5">ID: {active.id.slice(0, 12)}…</p>
                </div>
                <button onClick={() => setActive(null)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-5 space-y-5">
                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-stone-700">{active.description}</p>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Budget", value: active.budget ? `$${Number(active.budget).toLocaleString()}` : "—" },
                    { label: "Final Price", value: active.final_price ? `$${Number(active.final_price).toLocaleString()}` : "—" },
                    { label: "Deadline", value: active.deadline ? new Date(active.deadline).toLocaleDateString() : "—" },
                  ].map(m => (
                    <div key={m.label} className="bg-stone-50 rounded-xl p-3">
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider">{m.label}</p>
                      <p className="text-sm font-semibold text-stone-800 mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Status control */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setStatus(s)} disabled={saving}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active.status === s ? "bg-rose-500 text-white border-rose-500" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price + Payment Link */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Pricing & Payment</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Final Price ($)</Label>
                      <Input value={finalPrice} onChange={e => setFinalPrice(e.target.value)} type="number" min="0" placeholder="0" className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Assign Employee</Label>
                      <Select value={assignTo} onValueChange={setAssignTo}>
                        <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {employees.map((e: any) => (
                            <SelectItem key={e.id} value={e.id}>{e.full_name || e.email} {e.employee_code ? `(${e.employee_code})` : ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Stripe Payment Link (optional — client pays with 1 click)</Label>
                    <Input value={stripeLink} onChange={e => setStripeLink(e.target.value)} placeholder="https://buy.stripe.com/..." className="rounded-xl h-9 text-sm" />
                    <p className="text-[11px] text-stone-400">Create at stripe.com/payment-links — supports Google Pay, Apple Pay, UPI, card</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={savePrice} className="rounded-xl bg-rose-500 text-white border-0 h-9 px-4 text-sm">Save Price & Link</Button>
                    <Button onClick={assign} variant="outline" className="rounded-xl h-9 px-4 text-sm">Assign Employee</Button>
                  </div>
                </div>

                {/* Chat */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Client Chat</p>
                  <div className="bg-stone-50 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 mb-2">
                    {msgs.length === 0 && <p className="text-xs text-stone-400 text-center py-4">No messages yet.</p>}
                    {msgs.map((m: any) => (
                      <div key={m.id} className="text-xs bg-white rounded-lg px-3 py-2 border border-stone-100">
                        <p className="text-stone-400 mb-0.5">{m.sender_id.slice(0, 8)}…</p>
                        <p className="text-stone-700">{m.body}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendMsg} className="flex gap-2">
                    <Input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Reply to client…" className="rounded-xl h-9 text-sm flex-1" />
                    <Button type="submit" size="icon" className="rounded-xl bg-stone-800 text-white border-0 h-9 w-9"><Send className="w-3.5 h-3.5" /></Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
