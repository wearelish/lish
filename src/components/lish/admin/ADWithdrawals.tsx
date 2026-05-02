import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

const db = supabase as any;

export const ADWithdrawals = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["ad-withdrawals-full"],
    queryFn: async () => {
      const { data, error } = await db.from("withdrawals")
        .select("*, profiles(full_name, email, employee_code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = async (id: string, status: "approved" | "rejected") => {
    const { error } = await db.from("withdrawals").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Withdrawal ${status}`);
    qc.invalidateQueries({ queryKey: ["ad-withdrawals-full"] });
    qc.invalidateQueries({ queryKey: ["ad-withdrawals-home"] });
    // Sync employee dashboard
    qc.invalidateQueries({ queryKey: ["ep-withdrawals"] });
  };

  const pending = withdrawals.filter((w: any) => w.status === "pending").length;

  return (
    <div>
      <SectionHeader title="Withdrawal Requests" subtitle={`${pending} pending approval`} />

      <Table headers={["Employee", "Amount", "Method", "Status", "Requested", "Actions"]} empty={withdrawals.length === 0}>
        {withdrawals.map((w: any) => (
          <TR key={w.id}>
            <TD>
              <p className="font-medium text-sm">{w.profiles?.full_name || w.profiles?.email || "—"}</p>
              <p className="text-[10px] text-stone-400 font-mono">{w.profiles?.employee_code}</p>
            </TD>
            <TD className="font-semibold">${Number(w.amount).toLocaleString()}</TD>
            <TD className="text-xs">{w.upi_or_method || "—"}</TD>
            <TD>{statusBadge(w.status)}</TD>
            <TD className="text-xs text-stone-400">{new Date(w.created_at).toLocaleDateString()}</TD>
            <TD>
              {w.status === "pending" ? (
                <div className="flex gap-1.5">
                  <Button onClick={() => update(w.id, "approved")} size="sm"
                    className="h-7 px-2.5 rounded-lg bg-emerald-500 text-white border-0 text-xs">Approve</Button>
                  <Button onClick={() => update(w.id, "rejected")} size="sm"
                    className="h-7 px-2.5 rounded-lg bg-red-100 text-red-700 border-0 text-xs hover:bg-red-200">Reject</Button>
                </div>
              ) : (
                <span className="text-xs text-stone-400">{w.processed_at ? new Date(w.processed_at).toLocaleDateString() : "—"}</span>
              )}
            </TD>
          </TR>
        ))}
      </Table>
    </div>
  );
};
