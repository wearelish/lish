import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DollarSign, Clock, Wallet, ArrowUpRight, X } from "lucide-react";

export const EPEarnings = ({ checkedIn: _ }: { checkedIn: boolean }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", upi_or_method: "" });
  const [saving, setSaving] = useState(false);

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["ep-withdrawals", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("withdrawals").select("*").eq("employee_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const totalApproved = withdrawals.filter((w: any) => w.status === "approved").reduce((s: number, w: any) => s + Number(w.amount), 0);
  const pending = withdrawals.filter((w: any) => w.status === "pending").reduce((s: number, w: any) => s + Number(w.amount), 0);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !form.amount || Number(form.amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    const { error } = await (supabase as any).from("withdrawals").insert({ employee_id: user.id, amount: Number(form.amount), upi_or_method: form.upi_or_method || null });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Withdrawal request submitted!");
    setForm({ amount: "", upi_or_method: "" });
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ["ep-withdrawals", user.id] });
    qc.invalidateQueries({ queryKey: ["ad-withdrawals-full"] });
  };

  const statusColor: Record<string, string> = { pending: "bg-amber-100 text-amber-700", approved: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-stone-800">Earnings</h1><p className="text-sm text-stone-500 mt-0.5">Track your earnings and request withdrawals.</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: DollarSign, label: "Total Approved", value: `$${totalApproved.toLocaleString()}`, color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Clock, label: "Pending", value: `$${pending.toLocaleString()}`, color: "text-amber-500", bg: "bg-amber-50" },
          { icon: Wallet, label: "Requests", value: withdrawals.length, color: "text-primary", bg: "bg-primary/10" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}><c.icon className={`w-4 h-4 ${c.color}`} /></div>
            <p className="text-2xl font-bold text-stone-800">{c.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between gap-4">
        <div><p className="font-semibold text-stone-800">Request Withdrawal</p><p className="text-xs text-stone-500 mt-0.5">Submit a request to admin for approval.</p></div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl bg-primary text-white border-0 gap-2 h-9 text-sm shrink-0"><ArrowUpRight className="w-4 h-4" /> Withdraw</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-stone-800">Request Withdrawal</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-stone-400" /></button></div>
            <form onSubmit={request} className="space-y-4">
              <div className="space-y-1.5"><Label className="text-xs">Amount ($)</Label><Input type="number" min="1" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 500" className="rounded-xl h-11" /></div>
              <div className="space-y-1.5"><Label className="text-xs">UPI ID / Payment Method</Label><Input value={form.upi_or_method} onChange={e => setForm({ ...form, upi_or_method: e.target.value })} placeholder="yourname@upi" className="rounded-xl h-11" /></div>
              <Button type="submit" disabled={saving} className="w-full rounded-xl bg-primary text-white border-0 h-11">{saving ? "Submitting…" : "Submit Request"}</Button>
            </form>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-stone-700 mb-3">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center"><p className="text-stone-400 text-sm">No withdrawal requests yet.</p></div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w: any) => (
              <div key={w.id} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center justify-between gap-3">
                <div><p className="font-semibold text-stone-800">${Number(w.amount).toLocaleString()}</p><p className="text-xs text-stone-400 mt-0.5">{w.upi_or_method || "—"} · {new Date(w.created_at).toLocaleDateString()}</p></div>
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold ${statusColor[w.status] ?? "bg-stone-100 text-stone-500"}`}>{w.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
