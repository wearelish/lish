import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Clock, CheckCircle2, AlertCircle, Package,
  CreditCard, Download, ChevronDown, ChevronUp, Timer, X
} from "lucide-react";
import { PageHeader } from "./shared";
import type { CDSection } from "./ClientDashboard";

const db = supabase as any;

const PIPELINE: { status: string; label: string; desc: string }[] = [
  { status: "pending",      label: "Submitted",    desc: "Your request has been received" },
  { status: "under_review", label: "Under Review", desc: "Admin is reviewing your request" },
  { status: "price_sent",   label: "Price Sent",   desc: "Admin has sent a proposal" },
  { status: "in_progress",  label: "In Progress",  desc: "Work has started" },
  { status: "delivered",    label: "Delivered",    desc: "Files are ready for you" },
  { status: "completed",    label: "Completed",    desc: "Project complete" },
];

const STATUS_ORDER = PIPELINE.map(p => p.status);

const statusColor: Record<string, string> = {
  pending:      "bg-stone-100 text-stone-600",
  under_review: "bg-amber-100 text-amber-700",
  price_sent:   "bg-blue-100 text-blue-700",
  in_progress:  "bg-indigo-100 text-indigo-700",
  delivered:    "bg-purple-100 text-purple-700",
  completed:    "bg-emerald-100 text-emerald-700",
  rejected:     "bg-red-100 text-red-700",
  cancelled:    "bg-stone-100 text-stone-500",
};

// Payment modal
const PayModal = ({ request, type, onClose, onSuccess }: {
  request: any; type: "upfront" | "final"; onClose: () => void; onSuccess: () => void;
}) => {
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const price = Number(request.final_price) || 0;
  const amount = type === "upfront" ? price * 0.4 : price * 0.6;
  const stripeLink = request.stripe_payment_link;

  const confirmPay = async () => {
    setPaying(true);
    const updates: any = type === "upfront"
      ? { upfront_paid: true, status: "in_progress" }
      : { final_paid: true, status: "completed" };
    const { error } = await supabase.from("service_requests").update(updates).eq("id", request.id);
    setPaying(false);
    if (error) { toast.error("Payment confirmation failed: " + error.message); return; }
    setDone(true);
    setTimeout(() => { onSuccess(); onClose(); }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <p className="font-semibold">{type === "upfront" ? "Pay 40% to Start" : "Pay 60% Final"}</p>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold">Payment Confirmed!</p>
              <p className="text-sm text-stone-500 mt-1">
                {type === "upfront" ? "Work starts now." : "Project completed!"}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-4xl font-bold">${amount.toLocaleString()}</p>
                <p className="text-xs text-stone-400 mt-1">
                  {type === "upfront" ? "40% advance — unlocks project start" : "60% final — unlocks delivery files"}
                </p>
              </div>
              {stripeLink ? (
                <>
                  <a href={stripeLink} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg,#635BFF,#7B73FF)", boxShadow: "0 4px 16px rgba(99,91,255,0.3)" }}>
                    Pay with Google Pay / UPI / Card
                  </a>
                  <p className="text-[11px] text-center text-stone-400">Opens Stripe — supports all payment methods</p>
                  <div className="border-t border-stone-100 pt-3">
                    <p className="text-xs text-stone-500 text-center mb-2">Already paid?</p>
                    <Button onClick={confirmPay} disabled={paying} variant="outline" className="w-full rounded-xl h-10 text-sm">
                      {paying ? "Confirming…" : "Mark as Paid"}
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={confirmPay} disabled={paying} className="w-full rounded-xl h-11 bg-foreground text-background border-0">
                  {paying ? "Confirming…" : "Confirm Payment"}
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Pipeline progress bar
const PipelineBar = ({ status }: { status: string }) => {
  const idx = STATUS_ORDER.indexOf(status);
  const total = STATUS_ORDER.length - 1;
  const pct = idx < 0 ? 0 : Math.round((idx / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] text-stone-400">
        <span>Submitted</span><span>Completed</span>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))]" />
      </div>
      <p className="text-[11px] text-stone-500">
        {PIPELINE.find(p => p.status === status)?.desc ?? status}
      </p>
    </div>
  );
};

export const CDProjects = ({ onNavigate }: { onNavigate: (s: CDSection) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ request: any; type: "upfront" | "final" } | null>(null);
  const [filter, setFilter] = useState("all");

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-projects", uid],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_requests")
        .select("*").eq("client_id", uid!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const onPaySuccess = () => {
    qc.invalidateQueries({ queryKey: ["cd-projects", uid] });
    qc.invalidateQueries({ queryKey: ["cd-requests", uid] });
    toast.success("Payment confirmed!");
  };

  const filters = ["all", "active", "completed", "rejected"];
  const filtered = requests.filter((r: any) => {
    if (filter === "all") return true;
    if (filter === "active") return !["completed", "rejected", "cancelled"].includes(r.status);
    if (filter === "completed") return r.status === "completed";
    if (filter === "rejected") return ["rejected", "cancelled"].includes(r.status);
    return true;
  });

  return (
    <div>
      <PageHeader title="My Projects" subtitle="Track every request through the pipeline." />

      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-3xl p-14 text-center">
          <Package className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No projects yet.</p>
          <Button size="sm" onClick={() => onNavigate("new-request")} className="mt-3 rounded-full bg-foreground text-background border-0">
            Submit your first request
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any, i: number) => {
            const price = Number(r.final_price) || 0;
            const needsUpfront = r.status === "price_sent" && !r.upfront_paid && price > 0;
            const needsFinal = r.status === "delivered" && r.upfront_paid && !r.final_paid;
            const isOpen = expanded === r.id;

            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`glass-strong rounded-2xl overflow-hidden ${needsUpfront ? "border-2 border-amber-300/60" : needsFinal ? "border-2 border-purple-300/60" : ""}`}>

                {/* Header row */}
                <button className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  onClick={() => setExpanded(isOpen ? null : r.id)}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(r.created_at).toLocaleDateString()}
                      {r.proposal_deadline && ` · Due ${new Date(r.proposal_deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold ${statusColor[r.status] ?? "bg-muted text-muted-foreground"}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* CTA banners — always visible */}
                {needsUpfront && (
                  <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800">Price Proposal Received</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Final price: <strong>${price.toLocaleString()}</strong>
                        {r.proposal_deadline && ` · Deadline: ${new Date(r.proposal_deadline).toLocaleDateString()}`}
                      </p>
                      {r.scope_of_work && (
                        <div className="mt-2 p-2.5 bg-white/70 rounded-xl border border-amber-100">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 mb-1">Scope of Work</p>
                          <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">{r.scope_of_work}</p>
                        </div>
                      )}
                      {r.proposal_note && <p className="text-xs text-amber-600 mt-1.5 italic">"{r.proposal_note}"</p>}
                    </div>
                    <Button onClick={() => setPayModal({ request: r, type: "upfront" })} size="sm"
                      className="rounded-full bg-amber-500 hover:bg-amber-600 text-white border-0 h-9 px-4 text-xs shrink-0">
                      Accept & Pay ${(price * 0.4).toLocaleString()}
                    </Button>
                  </div>
                )}

                {needsFinal && (
                  <div className="mx-5 mb-4 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-purple-800">Files Delivered!</p>
                      <p className="text-xs text-purple-600 mt-0.5">Pay the remaining 60% to download your files.</p>
                    </div>
                    <Button onClick={() => setPayModal({ request: r, type: "final" })} size="sm"
                      className="rounded-full bg-purple-500 hover:bg-purple-600 text-white border-0 h-9 px-4 text-xs shrink-0">
                      Pay & Download ${(price * 0.6).toLocaleString()}
                    </Button>
                  </div>
                )}

                {/* Expanded detail */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-border">
                      <div className="p-5 space-y-4">
                        {/* Pipeline progress */}
                        <PipelineBar status={r.status} />

                        {/* Description */}
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                          <p className="text-sm">{r.description}</p>
                        </div>

                        {/* Pricing */}
                        {price > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-stone-50 rounded-xl p-3">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                              <p className="font-semibold text-sm mt-0.5">${price.toLocaleString()}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${r.upfront_paid ? "bg-emerald-50" : "bg-amber-50"}`}>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">40% Upfront</p>
                              <p className="font-semibold text-sm mt-0.5">${(price * 0.4).toLocaleString()}</p>
                              <p className={`text-[10px] font-medium mt-0.5 ${r.upfront_paid ? "text-emerald-600" : "text-amber-600"}`}>
                                {r.upfront_paid ? "✓ Paid" : "Pending"}
                              </p>
                            </div>
                            <div className={`rounded-xl p-3 ${r.final_paid ? "bg-emerald-50" : "bg-muted/40"}`}>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">60% Final</p>
                              <p className="font-semibold text-sm mt-0.5">${(price * 0.6).toLocaleString()}</p>
                              <p className={`text-[10px] font-medium mt-0.5 ${r.final_paid ? "text-emerald-600" : "text-muted-foreground"}`}>
                                {r.final_paid ? "✓ Paid" : "On delivery"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Delivery */}
                        {r.status === "delivered" && r.delivery_file_url && r.final_paid && (
                          <a href={r.delivery_file_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                            <Download className="w-4 h-4" /> Download Delivered Files
                          </a>
                        )}

                        {r.status === "delivered" && r.delivery_note && (
                          <div className="bg-purple-50 rounded-xl p-3">
                            <p className="text-xs text-purple-700">{r.delivery_note}</p>
                          </div>
                        )}

                        {/* In progress — deadline countdown */}
                        {r.status === "in_progress" && r.proposal_deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Timer className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Deadline:</span>
                            <span className="font-medium">{new Date(r.proposal_deadline).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Under review message */}
                        {r.status === "under_review" && (
                          <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-700">Admin is reviewing your request and will send a price proposal soon.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {payModal && (
          <PayModal request={payModal.request} type={payModal.type}
            onClose={() => setPayModal(null)} onSuccess={onPaySuccess} />
        )}
      </AnimatePresence>
    </div>
  );
};
