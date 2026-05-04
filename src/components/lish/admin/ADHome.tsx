import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FileText, FolderKanban, DollarSign, Clock, ArrowRight } from "lucide-react";
import { KpiCard, statusBadge, Table, TR, TD } from "./shared";
import type { ADSection } from "./AdminDashboard";

export const ADHome = ({ onNavigate }: { onNavigate: (s: ADSection) => void }) => {
  const { data: requests = [] } = useQuery({
    queryKey: ["ad-requests"],
    queryFn: async () => { const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false }); return data ?? []; },
    refetchInterval: 15000,
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["ad-emp-count"],
    queryFn: async () => { const { data } = await supabase.from("user_roles").select("user_id").eq("role", "employee"); return data ?? []; },
  });

  const active = requests.filter((r: any) => r.status === "in_progress").length;
  const revenue = requests.reduce((s: number, r: any) => s + (r.upfront_paid ? Number(r.final_price ?? 0) * 0.4 : 0) + (r.final_paid ? Number(r.final_price ?? 0) * 0.6 : 0), 0);
  const newRequests = requests.filter((r: any) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-800">Admin Overview</h1><p className="text-sm text-stone-500 mt-0.5">Full system status at a glance.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FileText} label="Total Requests" value={requests.length} color="rose" />
        <KpiCard icon={FolderKanban} label="Active Projects" value={active} color="indigo" />
        <KpiCard icon={DollarSign} label="Revenue Collected" value={`$${revenue.toLocaleString()}`} color="emerald" />
        <KpiCard icon={Clock} label="New Requests" value={newRequests} color="amber" />
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-700">Recent Requests</h2>
            <button onClick={() => onNavigate("requests")} className="text-xs text-rose-500 flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          <Table headers={["Title", "Status", "Budget", "Created"]}>
            {requests.slice(0, 6).map((r: any) => (
              <TR key={r.id} onClick={() => onNavigate("requests")}>
                <TD className="font-medium max-w-[200px] truncate">{r.title}</TD>
                <TD>{statusBadge(r.status)}</TD>
                <TD className="text-xs">{r.budget ? `$${Number(r.budget).toLocaleString()}` : "—"}</TD>
                <TD className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString()}</TD>
              </TR>
            ))}
          </Table>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Quick Stats</p>
          {[
            { label: "Employees", value: employees.length },
            { label: "Completed", value: requests.filter((r: any) => r.status === "completed").length },
            { label: "Delivered", value: requests.filter((r: any) => r.status === "delivered").length },
            { label: "Rejected", value: requests.filter((r: any) => r.status === "rejected").length },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
              <span className="text-sm text-stone-600">{s.label}</span>
              <span className="text-sm font-bold text-stone-800">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
