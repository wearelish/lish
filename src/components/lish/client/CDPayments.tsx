import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CreditCard, AlertCircle, CheckCircle2, Clock,
  X, Banknote, Smartphone, Timer
} from "lucide-react";
import { statusBadge, PageHeader, EmptyState } from "./shared";

const db = supabase as any;

// Demo payment modal
const PayModal = ({
  request,
  type,
  onClose,
  onSuccess,
}: {
  request: any;
  type: "upfront" | "final";
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [method, setMethod] = useState<"upi" | "card" | null>(null);
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState<"choose" | "confirm" | "processing" | "done">("choose");
  const price = Number(request.final_price) || 0;
  const amount = type === "upfront" ? price * 0.4 : price * 0.6;

  const pay = async () => {
    setStep("processing");
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1800));
    setPaying(true);
    const field = type === "upfront" ? "upfront_paid" : "final_paid";
    const updates: any = { [field]: true };
    // When upfront paid, set deadline start = now (deadline_started_at)
    if (type === "upfront") {
      updates.status = "in_progress";
    }
    const { error } = await supabase
      .from("service_requests")
      .update(updates)
      .eq("id", request.id);
    setPaying(false);
    if (error) {
      toast.error(error.message);
      setStep("confirm");
      return;
    }
    setStep("done");
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <p className="font-semibold text-stone-800">
              {type === "upfront" ? "Pay 40% Advance" : "Pay 60% Final"}
            </p>
            <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[200px]">{request.title}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-stone-800">${amount.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-1">
              {type === "upfront" ? "40% advance — work starts after payment" : "60% final — on delivery"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "choose" && (
              <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Choose payment method</p>
                {[
                  { id: "upi" as const, icon: Smartphone, label: "UPI / Bank Transfer", desc: "Pay via UPI, NEFT, or bank transfer" },
                  { id: "card" as const, icon: CreditCard, label: "Card / Stripe", desc: "Pay with debit or credit card" },
                ].map(m => (
                  <button key={m.id} onClick={() => { setMethod(m.id); setStep("confirm"); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-stone-100 hover:border-primary/40 hover:bg-primary/5 transition-all text-left">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <m.icon className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-stone-800">{m.label}</p>
                      <p className="text-xs text-stone-400">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {step === "confirm" && method && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {method === "upi" ? (
                  <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">UPI Payment Details</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">UPI ID</span>
                      <span className="font-mono text-sm font-semibold text-stone-800">lish@upi</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Amount</span>
                      <span className="font-semibold text-stone-800">${amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Reference</span>
                      <span className="font-mono text-xs text-stone-500">{request.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p className="text-[11px] text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                      After paying via UPI, click "Confirm Payment" below. Admin will verify and activate your project.
                    </p>
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Card / Stripe (Demo)</p>
                    <div className="space-y-2">
                      <div className="bg-white rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-400">4242 4242 4242 4242</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-400">12/28</div>
                        <div className="bg-white rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-400">123</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400">Demo mode — no real charge. Use test card above.</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setStep("choose")} variant="outline" className="flex-1 rounded-xl h-11">Back</Button>
                  <Button onClick={pay} className="flex-1 rounded-xl h-11 bg-foreground text-background border-0">
                    Confirm Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                <p className="text-sm font-medium text-stone-700">Processing payment…</p>
                <p className="text-xs text-stone-400">Please wait, do not close this window.</p>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <p className="text-lg font-bold text-stone-800">Payment Confirmed!</p>
                <p className="text-sm text-stone-500">
                  {type === "upfront" ? "Work has started. Deadline countdown begins now." : "Project marked as fully paid."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Deadline countdown
const DeadlineTimer = ({ deadline, startedAt }: { deadline: string | null; startedAt: boolean }) => {
  if (!deadline || !startedAt) return null;
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return <span className="text-xs text-red-500 font-medium flex items-center gap-1"><Timer className="w-3 h-3" /> Deadline passed</span>;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${days < 2 ? "text-red-500" : "text-emerald-600"}`}>
      <Timer className="w-3 h-3" />
      {days}d {hours}h remaining
    </span>
  );
};

export const CDPayments = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [payModal, setPayModal] = useState<{ request: any; type: "upfront" | "final" } | null>(null);

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-payments", uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, title, final_price, upfront_paid, final_paid, status, created_at, deadline")
        .eq("client_id", uid!)
        .in("status", ["accepted", "in_progress", "completed"] as any)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const totalDue = requests.reduce((sum: number, r: any) => {
    const price = Number(r.final_price) || 0;
    if (!price) return sum;
    const upfront = r.upfront_paid ? 0 : price * 0.4;
    const final = r.final_paid ? 0 : price * 0.6;
    return sum + upfront + final;
  }, 0);

  const onPaySuccess = () => {
    qc.invalidateQueries({ queryKey: ["cd-payments", uid] });
    qc.invalidateQueries({ queryKey: ["cd-requests", uid] });
    toast.success("Payment recorded! Admin will verify shortly.");
  };

  return (
    <div>
      <PageHeader title="Payments" subtitle="Pay your project invoices and track payment status." />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Due", value: `$${totalDue.toLocaleString()}`, gradient: true },
          { label: "Projects", value: requests.length, gradient: false },
          { label: "Fully Paid", value: requests.filter((r: any) => r.upfront_paid && r.final_paid).length, gradient: false, green: true },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-strong rounded-2xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`font-serif text-3xl font-semibold ${c.gradient ? "text-gradient" : c.green ? "text-emerald-600" : "text-foreground"}`}>
              {c.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Policy note */}
      <div className="flex items-start gap-3 glass rounded-2xl p-4 mb-6 border border-amber-200/60">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Payment policy:</span> Pay 40% advance to start work. Deadline countdown begins after advance payment. Pay remaining 60% on delivery.
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={CreditCard} text="No accepted projects yet. Payments appear once admin accepts and prices your request." />
      ) : (
        <div className="space-y-4">
          {requests.map((r: any, i: number) => {
            const price = Number(r.final_price) || 0;
            const upfront = price * 0.4;
            const final = price * 0.6;
            const needsUpfront = !r.upfront_paid && price > 0;
            const needsFinal = r.upfront_paid && !r.final_paid && r.status === "completed";

            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`glass-strong rounded-2xl p-5 ${needsUpfront ? "border-2 border-amber-300/60" : ""}`}>

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{r.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {statusBadge(r.status)}
                      <DeadlineTimer deadline={r.deadline} startedAt={r.upfront_paid} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg text-foreground">${price.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                </div>

                {/* Payment rows */}
                <div className="space-y-3">
                  {/* 40% upfront */}
                  <div className={`rounded-2xl p-4 flex items-center justify-between gap-3 ${r.upfront_paid ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${r.upfront_paid ? "bg-emerald-100" : "bg-amber-100"}`}>
                        {r.upfront_paid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Banknote className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">${upfront.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground">40% Advance — starts work</p>
                      </div>
                    </div>
                    {r.upfront_paid ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">✓ Paid</span>
                    ) : price > 0 ? (
                      <Button onClick={() => setPayModal({ request: r, type: "upfront" })} size="sm"
                        className="rounded-full bg-amber-500 hover:bg-amber-600 text-white border-0 h-8 px-4 text-xs font-semibold">
                        Pay Now
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Awaiting price</span>
                    )}
                  </div>

                  {/* 60% final */}
                  <div className={`rounded-2xl p-4 flex items-center justify-between gap-3 ${
                    r.final_paid ? "bg-emerald-50 border border-emerald-100" :
                    needsFinal ? "bg-blue-50 border border-blue-200" :
                    "bg-muted/40 border border-border"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${r.final_paid ? "bg-emerald-100" : needsFinal ? "bg-blue-100" : "bg-muted"}`}>
                        {r.final_paid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">${final.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground">60% Final — on delivery</p>
                      </div>
                    </div>
                    {r.final_paid ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">✓ Paid</span>
                    ) : needsFinal ? (
                      <Button onClick={() => setPayModal({ request: r, type: "final" })} size="sm"
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-0 h-8 px-4 text-xs font-semibold">
                        Pay Final
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground px-3">
                        {r.upfront_paid ? "Due on delivery" : "Locked"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Upfront CTA banner */}
                {needsUpfront && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-amber-700 font-medium">
                      ⚡ Pay the 40% advance to start your project and begin the deadline countdown.
                    </p>
                    <Button onClick={() => setPayModal({ request: r, type: "upfront" })} size="sm"
                      className="rounded-full bg-amber-500 hover:bg-amber-600 text-white border-0 h-8 px-4 text-xs shrink-0">
                      Pay ${upfront.toLocaleString()}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Payment modal */}
      <AnimatePresence>
        {payModal && (
          <PayModal
            request={payModal.request}
            type={payModal.type}
            onClose={() => setPayModal(null)}
            onSuccess={onPaySuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
