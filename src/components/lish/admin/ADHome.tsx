import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FileText, FolderKanban, DollarSign, Clock, ArrowRight } from "lucide-react";
import { KpiCard, statusBadge, Table, TR, TD } from "./shared";
import type { ADSection } from "./AdminDashboard";

const db = supabase as any;

export const ADHome = ({ onNavigate }: { onNavigate: (s: ADSection) => void }) => {
  const { data: requests = [] } = useQuery({
    queryKey: ["ad-requests"],
    queryFn: async () => { const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false }); return data ?? []; },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["ad-emp-count"],
    queryFn: async () => { const { data } = await supabase.from("user_roles").select("user_id").eq("role", "employee"); return data ?? []; },
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["ad-withdrawals-home"],
    queryFn: async () => { const { data } = await db.from("withdrawals").select("*").eq("status", "pending"); return data ?? []; },
  });

  const active = requests.filter((r: any) => r.status === "in_progress").length;
  const revenue = requests.reduce((s: number, r: any) => s + (r.upfront_paid ? Number(r.final_price ?? 0) * 0.4 : 0), 0);
  const pendingPay = requests.filter((r: any) => r.final_price && !r.upfront_paid && r.status === "accepted").length;
  const recent = requests.slice(0, 6);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-stone-800">Admin Overview</h1>
        <p className="text-sm text-stone-500 mt-0.5">Full system status at a glance.</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: "Total Requests", value: requests.length, color: "rose" },
          { icon: FolderKanban, label: "Active Projects", value: active, color: "indigo" },
          { icon: DollarSign, label: "Revenue Collected", value: `$${revenue.toLocaleString()}`, color: "emerald" },
          { icon: Clock, label: "Pending Payments", value: pendingPay, color: "amber" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KpiCard {...c} />
          </motion.div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent requests */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-700">Recent Requests</h2>
            <button onClick={() => onNavigate("requests")} className="text-xs text-rose-500 flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <Table headers={["Client", "Title", "Budget", "Status"]}>
            {recent.map((r: any) => (
              <TR key={r.id} onClick={() => onNavigate("requests")}>
                <TD className="text-xs text-stone-400">{r.client_id?.slice(0, 8)}…</TD>
                <TD className="font-medium max-w-[180px] truncate">{r.title}</TD>
                <TD>{r.budget ? `$${Number(r.budget).toLocaleString()}` : "—"}</TD>
                <TD>{statusBadge(r.status)}</TD>
              </TR>
            ))}
          </Table>
        </div>

        {/* Side stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Quick Stats</p>
            {[
              { label: "Total Employees", value: employees.length },
              { label: "Pending Withdrawals", value: withdrawals.length },
              { label: "Completed Projects", value: requests.filter((r: any) => r.status === "completed").length },
              { label: "Negotiating", value: requests.filter((r: any) => r.status === "negotiating").length },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <span className="text-sm text-stone-600">{s.label}</span>
                <span className="text-sm font-bold text-stone-800">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
