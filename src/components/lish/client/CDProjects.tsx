import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package, Download, ChevronDown, ChevronUp, Clock, Timer, X } from "lucide-react";
import { PageHeader, StatusBadge, statusLabel } from "./shared";
import type { CDSection } from "./ClientDashboard";

const PIPELINE_ORDER = ["pending", "under_review", "price_sent", "in_progress", "delivered", "completed"];

const PipelineBar = ({ status }: { status: string }) => {
  const idx = PIPELINE_ORDER.indexOf(status);
  const pct = idx < 0 ? 0 : Math.round((idx / (PIPELINE_ORDER.length - 1)) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] text-muted-foreground"><span>Pending Review</span><span>Completed</span></div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-pink-300 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const PayModal = ({ request, type, onClose, onDone }: { request: any; type: "upfront" | "final"; onClose: () => void; onDone: () => void }) => {
  const [paying, setPaying] = useState(false);
  const price = Number(request.final_price) || 0;
  const amount = type === "upfront" ? price * 0.4 : price * 0.6;

  const confirm = async () => {
    setPaying(true);
    const updates: any = type === "upfront" ? { upfront_paid: true, status: "in_progress" } : { final_paid: true, status: "completed" };
    const { error } = await supabase.from("service_requests").update(updates).eq("id", request.id);
    setPaying(false);
    if (error) { toast.error(error.message); return; }
    toast.success(type === "upfront" ? "Payment confirmed! Work starts now." : "Final payment confirmed! Project complete.");
    onDone(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <p className="font-semibold">{type === "upfront" ? "Pay 40% Advance" : "Pay 60% Final"}</p>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold">${amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{type === "upfront" ? "40% advance — unlocks project start" : "60% final — unlocks delivery files"}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
            <p className="font-medium mb-1">Payment Instructions</p>
            <p className="text-xs">Transfer ${amount.toLocaleString()} via bank transfer or UPI to the details provided by admin, then click confirm below.</p>
            {request.stripe_payment_link && (
              <a href={request.stripe_payment_link} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-blue-600 hover:underline">Or pay via payment link →</a>
            )}
          </div>
          <Button onClick={confirm} disabled={paying} className="w-full rounded-xl h-11 bg-foreground text-background border-0">
            {paying ? "Confirming…" : "Confirm Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CDProjects = ({ onNavigate }: { onNavigate: (s: CDSection) => void }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ request: any; type: "upfront" | "final" } | null>(null);
  const [filter, setFilter] = useState("all");

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_requests").select("*").eq("client_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const filtered = requests.filter((r: any) => {
    if (filter === "all") return true;
    if (filter === "active") return !["completed", "rejected", "cancelled"].includes(r.status);
    if (filter === "completed") return r.status === "completed";
    if (filter === "rejected") return ["rejected", "cancelled"].includes(r.status);
    return true;
  });

  const reload = () => {
    qc.invalidateQueries({ queryKey: ["cd-projects", user?.id] });
    qc.invalidateQueries({ queryKey: ["cd-requests", user?.id] });
  };

  return (
    <div>
      <PageHeader title="My Projects" subtitle="Track every request through the pipeline." />
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "active", "completed", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-14 text-center">
          <Package className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No projects yet.</p>
          <Button size="sm" onClick={() => onNavigate("new-request")} className="mt-3 rounded-full bg-foreground text-background border-0">Submit your first request</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => {
            const price = Number(r.final_price) || 0;
            const needsUpfront = r.status === "price_sent" && !r.upfront_paid && price > 0;
            const needsFinal = r.status === "delivered" && r.upfront_paid && !r.final_paid;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className={`glass-card rounded-2xl overflow-hidden ${needsUpfront ? "border-2 border-amber-300/60" : needsFinal ? "border-2 border-purple-300/60" : ""}`}>
                <button className="w-full flex items-center justify-between gap-4 p-5 text-left" onClick={() => setExpanded(isOpen ? null : r.id)}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={r.status} />
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Proposal banner */}
                {needsUpfront && (
                  <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Proposal Received — Review & Accept</p>
                        <p className="text-xs text-amber-700 mt-1">Final price: <strong>${price.toLocaleString()}</strong>{r.proposal_deadline && ` · Deadline: ${new Date(r.proposal_deadline).toLocaleDateString()}`}</p>
                        {r.scope_of_work && <p className="text-xs text-amber-700 mt-1"><strong>Scope:</strong> {r.scope_of_work}</p>}
                        {r.proposal_note && <p className="text-xs text-amber-600 mt-1 italic">"{r.proposal_note}"</p>}
                      </div>
                      <Button onClick={() => setPayModal({ request: r, type: "upfront" })} size="sm" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white border-0 h-9 px-4 text-xs shrink-0">
                        Accept & Pay ${(price * 0.4).toLocaleString()}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Final payment banner */}
                {needsFinal && (
                  <div className="mx-5 mb-4 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-purple-800">Files Delivered!</p>
                      <p className="text-xs text-purple-600 mt-0.5">Pay the remaining 60% to download your files.</p>
                    </div>
                    <Button onClick={() => setPayModal({ request: r, type: "final" })} size="sm" className="rounded-full bg-purple-500 hover:bg-purple-600 text-white border-0 h-9 px-4 text-xs shrink-0">
                      Pay & Download ${(price * 0.6).toLocaleString()}
                    </Button>
                  </div>
                )}

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-border p-5 space-y-4">
                    <PipelineBar status={r.status} />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm">{r.description}</p>
                    </div>
                    {r.scope_of_work && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Scope of Work</p>
                        <p className="text-sm text-blue-800">{r.scope_of_work}</p>
                      </div>
                    )}
                    {price > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-stone-50 rounded-xl p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p><p className="font-semibold text-sm mt-0.5">${price.toLocaleString()}</p></div>
                        <div className={`rounded-xl p-3 ${r.upfront_paid ? "bg-emerald-50" : "bg-amber-50"}`}><p className="text-[10px] text-muted-foreground uppercase tracking-wider">40% Upfront</p><p className="font-semibold text-sm mt-0.5">${(price * 0.4).toLocaleString()}</p><p className={`text-[10px] font-medium mt-0.5 ${r.upfront_paid ? "text-emerald-600" : "text-amber-600"}`}>{r.upfront_paid ? "✓ Paid" : "Pending"}</p></div>
                        <div className={`rounded-xl p-3 ${r.final_paid ? "bg-emerald-50" : "bg-muted/40"}`}><p className="text-[10px] text-muted-foreground uppercase tracking-wider">60% Final</p><p className="font-semibold text-sm mt-0.5">${(price * 0.6).toLocaleString()}</p><p className={`text-[10px] font-medium mt-0.5 ${r.final_paid ? "text-emerald-600" : "text-muted-foreground"}`}>{r.final_paid ? "✓ Paid" : "On delivery"}</p></div>
                      </div>
                    )}
                    {r.status === "delivered" && r.delivery_file_url && r.final_paid && (
                      <a href={r.delivery_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                        <Download className="w-4 h-4" /> Download Delivered Files
                      </a>
                    )}
                    {r.status === "delivered" && !r.final_paid && (
                      <p className="text-xs text-purple-600 bg-purple-50 rounded-xl px-3 py-2">Pay the final 60% above to unlock your download.</p>
                    )}
                    {r.status === "in_progress" && r.proposal_deadline && (
                      <div className="flex items-center gap-2 text-sm"><Timer className="w-4 h-4 text-primary" /><span className="text-muted-foreground">Deadline:</span><span className="font-medium">{new Date(r.proposal_deadline).toLocaleDateString()}</span></div>
                    )}
                    {["pending", "under_review"].includes(r.status) && (
                      <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700">Admin is reviewing your request. You'll be notified when a proposal is ready.</p>
                      </div>
                    )}
                    {r.status === "rejected" && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-red-700 mb-1">Request Rejected</p>
                        <p className="text-xs text-red-600">{r.rejection_reason || "No reason provided. Please contact support."}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {payModal && <PayModal request={payModal.request} type={payModal.type} onClose={() => setPayModal(null)} onDone={reload} />}
    </div>
  );
};
