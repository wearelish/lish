import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DollarSign, Clock, Wallet, ArrowUpRight } from "lucide-react";

const db = supabase as any;

export const EPEarnings = ({ checkedIn: _ }: { checkedIn: boolean }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", upi_or_method: "" });
  const [saving, setSaving] = useState(false);

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["ep-withdrawals", uid],
    queryFn: async () => {
      const { data, error } = await db.from("withdrawals").select("*").eq("employee_id", uid!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  // Total earned = sum of all approved withdrawals + pending withdrawals
  // (represents money the employee has been paid or is owed)
  const totalWithdrawn = withdrawals.filter((w: any) => w.status === "approved").reduce((s: number, w: any) => s + Number(w.amount), 0);
  const pending = withdrawals.filter((w: any) => w.status === "pending").reduce((s: number, w: any) => s + Number(w.amount), 0);
  // totalEarned is derived from approved + pending (what admin has acknowledged)
  const totalEarned = totalWithdrawn + pending;
  const available = Math.max(0, totalEarned - totalWithdrawn - pending);

  const requestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !form.amount || Number(form.amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    const { error } = await db.from("withdrawals").insert({
      employee_id: uid,
      amount: Number(form.amount),
      upi_or_method: form.upi_or_method || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Withdrawal request submitted!");
    setForm({ amount: "", upi_or_method: "" });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["ep-withdrawals", uid] });
    // Notify admin side
    qc.invalidateQueries({ queryKey: ["ad-withdrawals-full"] });
    qc.invalidateQueries({ queryKey: ["ad-withdrawals-home"] });
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Earnings</h1>
        <p className="text-sm text-stone-500 mt-0.5">Track your earnings and request withdrawals.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: DollarSign, label: "Total Earned", value: `$${totalEarned.toLocaleString()}`, color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Clock, label: "Pending", value: `$${pending.toLocaleString()}`, color: "text-amber-500", bg: "bg-amber-50" },
          { icon: Wallet, label: "Available", value: `$${available.toLocaleString()}`, color: "text-primary", bg: "bg-primary/10" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-stone-800">{c.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Request withdrawal */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-stone-800">Request Withdrawal</p>
          <p className="text-xs text-stone-500 mt-0.5">Submit a withdrawal request to admin for approval.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary text-white border-0 gap-2 h-9 text-sm shrink-0">
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader><DialogTitle className="font-bold">Request Withdrawal</DialogTitle></DialogHeader>
            <form onSubmit={requestWithdrawal} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Amount ($)</Label>
                <Input type="number" min="1" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 500" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">UPI ID / Payment Method</Label>
                <Input value={form.upi_or_method} onChange={e => setForm({ ...form, upi_or_method: e.target.value })}
                  placeholder="yourname@upi" className="rounded-xl h-11" />
              </div>
              <Button type="submit" disabled={saving} className="w-full rounded-xl bg-primary text-white border-0 h-11">
                {saving ? "Submitting…" : "Submit Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Withdrawal history */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="font-semibold text-stone-700 mb-3">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
            <p className="text-stone-400 text-sm">No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w: any, i: number) => (
              <motion.div key={w.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">${Number(w.amount).toLocaleString()}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{w.upi_or_method || "—"} · {new Date(w.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold ${statusColor[w.status] ?? "bg-stone-100 text-stone-500"}`}>
                  {w.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
