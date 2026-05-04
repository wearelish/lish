import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X, Eye } from "lucide-react";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

const STATUSES = ["pending", "under_review", "price_sent", "in_progress", "delivered", "completed", "rejected", "cancelled"];
const STATUS_LABELS: Record<string, string> = { pending: "Pending", under_review: "Under Review", price_sent: "Proposal Sent", in_progress: "In Progress", delivered: "Delivered", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled" };

export const ADRequests = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const [active, setActive] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [propPrice, setPropPrice] = useState("");
  const [propScope, setPropScope] = useState("");
  const [propDeadline, setPropDeadline] = useState("");
  const [propNote, setPropNote] = useState("");
  const [propLink, setPropLink] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [assignTo, setAssignTo] = useState("");

  const { data: requests = [] } = useQuery({
    queryKey: ["ad-requests-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_requests").select("*, profiles!service_requests_client_id_fkey(full_name, email)").order("created_at", { ascending: false });
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
      const { data } = await supabase.from("profiles").select("id,full_name,email,employee_code").in("id", roles.map((r: any) => r.user_id));
      return data ?? [];
    },
  });

  const reload = () => {
    qc.invalidateQueries({ queryKey: ["ad-requests-full"] });
    qc.invalidateQueries({ queryKey: ["ad-requests"] });
    qc.invalidateQueries({ queryKey: ["cd-projects"] });
    qc.invalidateQueries({ queryKey: ["cd-requests"] });
    qc.invalidateQueries({ queryKey: ["cd-payments"] });
  };

  const setStatus = async (id: string, status: string, extra?: any) => {
    setSaving(true);
    const { error } = await supabase.from("service_requests").update({ status, ...extra } as any).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    if (active?.id === id) setActive({ ...active, status, ...extra });
    reload();
    toast.success(`Status → ${STATUS_LABELS[status] ?? status}`);
  };

  const sendProposal = async () => {
    if (!active || !propPrice) { toast.error("Price is required"); return; }
    if (!propScope.trim()) { toast.error("Scope of work is required"); return; }
    setSaving(true);
    const updates: any = { final_price: Number(propPrice), status: "price_sent", scope_of_work: propScope.trim(), proposal_note: propNote || null, proposal_deadline: propDeadline || null };
    if (propLink) updates.stripe_payment_link = propLink;
    const { error } = await supabase.from("service_requests").update(updates as any).eq("id", active.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, ...updates });
    reload();
    toast.success("Proposal sent to client!");
  };

  const rejectRequest = async () => {
    if (!active) return;
    await setStatus(active.id, "rejected", { rejection_reason: rejectReason || null });
    setShowReject(false);
    setRejectReason("");
  };

  const deliver = async () => {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase.from("service_requests").update({ status: "delivered", delivery_file_url: deliveryUrl || null, delivery_note: deliveryNote || null, delivered_at: new Date().toISOString() } as any).eq("id", active.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setActive({ ...active, status: "delivered" });
    reload();
    toast.success("Delivery sent to client!");
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
    setActive(r); setShowReject(false);
    setPropPrice(r.final_price?.toString() ?? "");
    setPropScope(r.scope_of_work ?? "");
    setPropDeadline(r.proposal_deadline ?? "");
    setPropNote(r.proposal_note ?? "");
    setPropLink(r.stripe_payment_link ?? "");
    setRejectReason(r.rejection_reason ?? "");
    setDeliveryUrl(r.delivery_file_url ?? "");
    setDeliveryNote(r.delivery_note ?? "");
    setAssignTo(r.assigned_employee_id ?? "");
  };

  const filtered = filter === "all" ? requests : requests.filter((r: any) => r.status === filter);

  return (
    <div>
      <SectionHeader title="Request Pipeline" subtitle={`${requests.length} total · ${requests.filter((r: any) => r.status === "pending").length} new`} />
      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...STATUSES].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{STATUS_LABELS[f] ?? f}</button>
        ))}
      </div>

      <Table headers={["Client", "Title", "Status", "Price", "Payment", "Date", "Actions"]} empty={filtered.length === 0}>
        {filtered.map((r: any) => (
          <TR key={r.id}>
            <TD className="text-xs text-stone-400">{(r as any).profiles?.full_name || (r as any).profiles?.email || r.client_id?.slice(0, 8) + "…"}</TD>
            <TD><p className="font-medium max-w-[160px] truncate">{r.title}</p></TD>
            <TD>{statusBadge(r.status)}</TD>
            <TD className="text-sm font-medium">{r.final_price ? `$${Number(r.final_price).toLocaleString()}` : "—"}</TD>
            <TD><div className="flex gap-1 text-[10px]">
              <span className={`px-1.5 py-0.5 rounded ${r.upfront_paid ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>40%</span>
              <span className={`px-1.5 py-0.5 rounded ${r.final_paid ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>60%</span>
            </div></TD>
            <TD className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString()}</TD>
            <TD>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => openRequest(r)} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-all flex items-center gap-1"><Eye className="w-3 h-3" /> Open</button>
                {r.status === "pending" && <button onClick={() => setStatus(r.id, "under_review")} className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-all">Review</button>}
                {r.status === "pending" && <button onClick={() => { openRequest(r); setShowReject(true); }} className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-all">Reject</button>}
              </div>
            </TD>
          </TR>
        ))}
      </Table>

      {/* Detail panel */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[95vh] overflow-y-auto">
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

              {/* Pipeline stage */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Pipeline Stage</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setStatus(active.id, s)} disabled={saving}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active.status === s ? "bg-rose-500 text-white border-rose-500" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reject with reason */}
              {(showReject || active.status === "rejected") && (
                <div className="bg-red-50 rounded-2xl p-4 space-y-3 border border-red-200">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Reject Request</p>
                  <div className="space-y-1">
                    <Label className="text-xs">Reason (client will see this)</Label>
                    <Textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Budget too low for requested scope…" className="rounded-xl resize-none text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={rejectRequest} disabled={saving} className="rounded-xl bg-red-500 text-white border-0 h-9 text-sm flex-1">{saving ? "Rejecting…" : "Confirm Rejection"}</Button>
                    <Button onClick={() => setShowReject(false)} variant="outline" size="sm" className="rounded-xl h-9">Cancel</Button>
                  </div>
                </div>
              )}

              {/* Send Proposal */}
              {["pending", "under_review", "price_sent"].includes(active.status) && (
                <div className="bg-amber-50 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Send Price Proposal</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Final Price ($) *</Label><Input value={propPrice} onChange={e => setPropPrice(e.target.value)} type="number" min="0" placeholder="0" className="rounded-xl h-9 text-sm" /></div>
                    <div className="space-y-1"><Label className="text-xs">Deadline</Label><Input type="date" value={propDeadline} onChange={e => setPropDeadline(e.target.value)} className="rounded-xl h-9 text-sm" /></div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Scope of Work * <span className="text-amber-600">(required — client will see this)</span></Label>
                    <Textarea rows={4} value={propScope} onChange={e => setPropScope(e.target.value)} placeholder="Describe exactly what will be delivered: features, pages, tech stack, revisions…" className="rounded-xl resize-none text-sm" />
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Note to client (optional)</Label><Textarea rows={2} value={propNote} onChange={e => setPropNote(e.target.value)} placeholder="Any extra notes…" className="rounded-xl resize-none text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">Payment Link (optional)</Label><Input value={propLink} onChange={e => setPropLink(e.target.value)} placeholder="https://rzp.io/... or UPI ID" className="rounded-xl h-9 text-sm" /></div>
                  <Button onClick={sendProposal} disabled={saving} className="w-full rounded-xl bg-amber-500 text-white border-0 h-9 text-sm">{saving ? "Sending…" : "Send Proposal to Client"}</Button>
                </div>
              )}

              {/* Assign employee */}
              {["price_sent", "in_progress"].includes(active.status) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Assign Employee</p>
                  <div className="flex gap-2">
                    <Select value={assignTo} onValueChange={setAssignTo}>
                      <SelectTrigger className="rounded-xl h-9 text-sm flex-1"><SelectValue placeholder="Select employee…" /></SelectTrigger>
                      <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.full_name || e.email} {e.employee_code ? `(${e.employee_code})` : ""}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={assign} size="sm" className="rounded-xl bg-stone-800 text-white border-0 h-9 px-3">Assign</Button>
                  </div>
                </div>
              )}

              {/* Deliver */}
              {active.status === "in_progress" && (
                <div className="bg-purple-50 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Deliver Project</p>
                  <div className="space-y-1"><Label className="text-xs">File URL (Google Drive, Dropbox, etc.)</Label><Input value={deliveryUrl} onChange={e => setDeliveryUrl(e.target.value)} placeholder="https://drive.google.com/..." className="rounded-xl h-9 text-sm" /></div>
                  <div className="space-y-1"><Label className="text-xs">Delivery note</Label><Textarea rows={2} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="Notes about the delivery…" className="rounded-xl resize-none text-sm" /></div>
                  <Button onClick={deliver} disabled={saving} className="w-full rounded-xl bg-purple-500 text-white border-0 h-9 text-sm">{saving ? "Delivering…" : "Mark as Delivered"}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
