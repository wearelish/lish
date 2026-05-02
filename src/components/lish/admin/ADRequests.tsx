import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X, Send, CheckCircle, XCircle, Eye } from "lucide-react";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

const db = supabase as any;

const PIPELINE_STATUSES = [
  "pending", "under_review", "price_sent", "in_progress", "delivered", "completed", "rejected", "cancelled"
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Submitted", under_review: "Under Review", price_sent: "Price Sent",
  in_progress: "In Progress", delivered: "Delivered", completed: "Completed",
  rejected: "Rejected", cancelled: "Cancelled",
};

export const ADRequests = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const [active, setActive] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  // Proposal form
  const [propPrice, setPropPrice] = useState("");
  const [propDeadline, setPropDeadline] = useState("");
  const [propNote, setPropNote] = useState("");
  const [propStripe, setPropStripe] = useState("");

  // Delivery form
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  // Assign
  const [assignTo, setAssignTo] = useState("");

  const { data: requests = [] } = useQuery({
    queryKey: ["ad-requests-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, profiles!service_requests_client_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 10000,
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

  const reload = () => {
    qc.invalidateQueries({ queryKey: ["ad-requests-full"] });
    qc.invalidateQueries({ queryKey: ["ad-requests"] });
    // Invalidate client-side queries so their dashboards update live
    qc.invalidateQueries({ queryKey: ["cd-requests"] });
    qc.invalidateQueries({ queryKey: ["cd-projects"] });
    qc.invalidateQueries({ queryKey: ["cd-payments"] });
    qc.invalidateQueries({ queryKey: ["cd-home-msgs"] });
  };

  const setStatus = async (id: string, status: string) => {
    setSaving(true);
    const { error } = await supabase.from("service_requests").update({ status } as any).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    if (active?.id === id) setActive({ ...active, status });
    reload();
    toast.success(`→ ${STATUS_LABELS[status] ?? status}`);
  };

  const sendProposal = async () => {
    if (!active || !propPrice) { toast.error("Enter a price"); return; }
    setSaving(true);
    const updates: any = {
      final_price: Number(propPrice),
      status: "price_sent",
      proposal_note: propNote || null,
      proposal_deadline: propDeadline || null,
    };
    if (propStripe) updates.stripe_payment_link = propStripe;
    const { error } = await supabase.from("service_requests").update(updates).eq("id", active.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, ...updates });
    reload();
    toast.success("Proposal sent to client");
  };

  const deliver = async () => {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase.from("service_requests").update({
      status: "delivered",
      delivery_file_url: deliveryUrl || null,
      delivery_note: deliveryNote || null,
      delivered_at: new Date().toISOString(),
    } as any).eq("id", active.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, status: "delivered" });
    reload();
    toast.success("Delivery sent to client");
  };

  const assign = async () => {
    if (!active || !assignTo) return;
    const { error } = await supabase.from("service_requests").update({ assigned_employee_id: assignTo } as any).eq("id", active.id);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, assigned_employee_id: assignTo });
    reload();
    toast.success("Employee assigned");
  };

  const openRequest = (r: any) => {
    setActive(r);
    setPropPrice(r.final_price?.toString() ?? "");
    setPropDeadline(r.proposal_deadline ?? "");
    setPropNote(r.proposal_note ?? "");
    setPropStripe(r.stripe_payment_link ?? "");
    setDeliveryUrl(r.delivery_file_url ?? "");
    setDeliveryNote(r.delivery_note ?? "");
    setAssignTo(r.assigned_employee_id ?? "");
  };

  const filtered = filter === "all" ? requests : requests.filter((r: any) => r.status === filter);

  return (
    <div>
      <SectionHeader title="Request Pipeline" subtitle={`${requests.length} total · ${requests.filter((r: any) => r.status === "pending").length} new`} />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...PIPELINE_STATUSES].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
            {STATUS_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      <Table headers={["Title", "Status", "Price", "Payment", "Created", "Actions"]} empty={filtered.length === 0}>
        {filtered.map((r: any) => (
          <TR key={r.id}>
            <TD><p className="font-medium max-w-[180px] truncate">{r.title}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{(r as any).profiles?.full_name || (r as any).profiles?.email || r.client_id?.slice(0, 8) + "…"}</p>
            </TD>
            <TD>{statusBadge(r.status)}</TD>
            <TD className="text-sm font-medium">{r.final_price ? `$${Number(r.final_price).toLocaleString()}` : "—"}</TD>
            <TD>
              <div className="flex gap-1 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded ${r.upfront_paid ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>40%</span>
                <span className={`px-1.5 py-0.5 rounded ${r.final_paid ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>60%</span>
              </div>
            </TD>
            <TD className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString()}</TD>
            <TD>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => openRequest(r)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-all flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Open
                </button>
                {r.status === "pending" && (
                  <button onClick={() => setStatus(r.id, "under_review")}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-all">
                    Review
                  </button>
                )}
                {r.status === "pending" && (
                  <button onClick={() => setStatus(r.id, "rejected")}
                    className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-all">
                    Reject
                  </button>
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

              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-5 border-b border-stone-100 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="font-bold text-stone-800">{active.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {statusBadge(active.status)}
                    {active.upfront_paid && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">40% paid</span>}
                    {active.final_paid && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">60% paid</span>}
                  </div>
                </div>
                <button onClick={() => setActive(null)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-5 space-y-5">
                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-stone-700">{active.description}</p>
                  {active.budget && <p className="text-xs text-stone-400 mt-1">Client budget: ${Number(active.budget).toLocaleString()}</p>}
                </div>

                {/* Pipeline status buttons */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Pipeline Stage</p>
                  <div className="flex gap-2 flex-wrap">
                    {PIPELINE_STATUSES.map(s => (
                      <button key={s} onClick={() => setStatus(active.id, s)} disabled={saving}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active.status === s ? "bg-rose-500 text-white border-rose-500" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Send Proposal — shown when under_review or price_sent */}
                {["pending", "under_review", "price_sent"].includes(active.status) && (
                  <div className="bg-amber-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Send Price Proposal</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Final Price ($) *</Label>
                        <Input value={propPrice} onChange={e => setPropPrice(e.target.value)} type="number" min="0" placeholder="0" className="rounded-xl h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Deadline</Label>
                        <Input type="date" value={propDeadline} onChange={e => setPropDeadline(e.target.value)} className="rounded-xl h-9 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Note to client (optional)</Label>
                      <Textarea rows={2} value={propNote} onChange={e => setPropNote(e.target.value)} placeholder="Any notes for the client…" className="rounded-xl resize-none text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stripe Payment Link (optional)</Label>
                      <Input value={propStripe} onChange={e => setPropStripe(e.target.value)} placeholder="https://buy.stripe.com/..." className="rounded-xl h-9 text-sm" />
                    </div>
                    <Button onClick={sendProposal} disabled={saving} className="w-full rounded-xl bg-amber-500 text-white border-0 h-9 text-sm">
                      {saving ? "Sending…" : "Send Proposal to Client"}
                    </Button>
                  </div>
                )}

                {/* Assign employee */}
                {["in_progress", "price_sent", "accepted"].includes(active.status) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Assign Employee</p>
                    <div className="flex gap-2">
                      <Select value={assignTo} onValueChange={setAssignTo}>
                        <SelectTrigger className="rounded-xl h-9 text-sm flex-1"><SelectValue placeholder="Select employee…" /></SelectTrigger>
                        <SelectContent>
                          {employees.map((e: any) => (
                            <SelectItem key={e.id} value={e.id}>{e.full_name || e.email} {e.employee_code ? `(${e.employee_code})` : ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={assign} size="sm" className="rounded-xl bg-stone-800 text-white border-0 h-9 px-3">Assign</Button>
                    </div>
                  </div>
                )}

                {/* Deliver project */}
                {active.status === "in_progress" && (
                  <div className="bg-purple-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Deliver Project</p>
                    <div className="space-y-1">
                      <Label className="text-xs">File URL (Google Drive, Dropbox, etc.)</Label>
                      <Input value={deliveryUrl} onChange={e => setDeliveryUrl(e.target.value)} placeholder="https://drive.google.com/..." className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Delivery note</Label>
                      <Textarea rows={2} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="Notes about the delivery…" className="rounded-xl resize-none text-sm" />
                    </div>
                    <Button onClick={deliver} disabled={saving} className="w-full rounded-xl bg-purple-500 text-white border-0 h-9 text-sm">
                      {saving ? "Delivering…" : "Mark as Delivered"}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
