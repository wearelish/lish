import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SectionHeader, statusBadge, Table, TR, TD, KpiCard } from "./shared";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const ADPayments = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const { data: requests = [] } = useQuery({
    queryKey: ["ad-payments-full"],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("id,title,client_id,final_price,upfront_paid,final_paid,status,created_at").not("final_price", "is", null).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const markPaid = async (id: string, field: "upfront_paid" | "final_paid") => {
    const updates: any = { [field]: true };
    if (field === "upfront_paid") updates.status = "in_progress";
    if (field === "final_paid") updates.status = "completed";
    const { error } = await supabase.from("service_requests").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Marked as paid");
    qc.invalidateQueries({ queryKey: ["ad-payments-full"] });
    qc.invalidateQueries({ queryKey: ["cd-payments"] });
    qc.invalidateQueries({ queryKey: ["cd-projects"] });
  };

  const totalRevenue = requests.reduce((s: number, r: any) => {
    const p = Number(r.final_price) || 0;
    return s + (r.upfront_paid ? p * 0.4 : 0) + (r.final_paid ? p * 0.6 : 0);
  }, 0);

  return (
    <div>
      <SectionHeader title="Payment Control" subtitle="Track and verify all project payments." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={DollarSign} label="Total Collected" value={`$${totalRevenue.toLocaleString()}`} color="emerald" />
        <KpiCard icon={Clock} label="Pending Upfront" value={requests.filter((r: any) => !r.upfront_paid).length} color="amber" />
        <KpiCard icon={AlertCircle} label="Awaiting Final" value={requests.filter((r: any) => r.upfront_paid && !r.final_paid).length} color="rose" />
        <KpiCard icon={CheckCircle} label="Fully Paid" value={requests.filter((r: any) => r.upfront_paid && r.final_paid).length} color="blue" />
      </div>
      <Table headers={["Project", "Total", "40% Upfront", "60% Final", "Status"]} empty={requests.length === 0}>
        {requests.map((r: any) => {
          const price = Number(r.final_price) || 0;
          return (
            <TR key={r.id}>
              <TD><p className="font-medium max-w-[160px] truncate">{r.title}</p></TD>
              <TD className="font-semibold">${price.toLocaleString()}</TD>
              <TD>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${r.upfront_paid ? "text-emerald-600" : "text-amber-600"}`}>{r.upfront_paid ? "✓ Paid" : `$${(price * 0.4).toLocaleString()}`}</span>
                  {!r.upfront_paid && <Button onClick={() => markPaid(r.id, "upfront_paid")} size="sm" className="h-6 px-2 rounded-lg bg-emerald-500 text-white border-0 text-[10px]">Mark Paid</Button>}
                </div>
              </TD>
              <TD>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${r.final_paid ? "text-emerald-600" : r.upfront_paid ? "text-amber-600" : "text-stone-400"}`}>{r.final_paid ? "✓ Paid" : r.upfront_paid ? `$${(price * 0.6).toLocaleString()}` : "Locked"}</span>
                  {r.upfront_paid && !r.final_paid && <Button onClick={() => markPaid(r.id, "final_paid")} size="sm" className="h-6 px-2 rounded-lg bg-emerald-500 text-white border-0 text-[10px]">Mark Paid</Button>}
                </div>
              </TD>
              <TD>{statusBadge(r.status)}</TD>
            </TR>
          );
        })}
      </Table>
    </div>
  );
};
