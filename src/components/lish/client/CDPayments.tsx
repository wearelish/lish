import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageHeader, StatusBadge } from "./shared";

export const CDPayments = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const { data: requests = [] } = useQuery({
    queryKey: ["cd-payments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("id,title,final_price,upfront_paid,final_paid,status,created_at").eq("client_id", user!.id).not("final_price", "is", null).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const totalDue = requests.reduce((s: number, r: any) => {
    const p = Number(r.final_price) || 0;
    return s + (!r.upfront_paid ? p * 0.4 : 0) + (!r.final_paid && r.status === "delivered" ? p * 0.6 : 0);
  }, 0);

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track all your project payments." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Due", value: `$${totalDue.toLocaleString()}`, gradient: true },
          { label: "Projects", value: requests.length },
          { label: "Fully Paid", value: requests.filter((r: any) => r.upfront_paid && r.final_paid).length, green: true },
        ].map((c) => (
          <div key={c.label} className="glass-card rounded-2xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`font-serif text-3xl font-semibold ${c.gradient ? "text-gradient" : c.green ? "text-emerald-600" : "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 glass-card rounded-2xl p-4 mb-6 border border-amber-200/60">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Payment policy:</span> Pay 40% advance to start work. Pay remaining 60% on delivery to unlock files.</p>
      </div>

      {requests.length === 0 ? (
        <div className="glass-card rounded-3xl p-14 text-center">
          <CreditCard className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No payments yet. Payments appear once admin prices your request.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r: any) => {
            const price = Number(r.final_price) || 0;
            return (
              <div key={r.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-sm">{r.title}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg">${price.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`rounded-xl p-3 flex items-center justify-between ${r.upfront_paid ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-200"}`}>
                    <div className="flex items-center gap-2">
                      {r.upfront_paid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                      <div><p className="text-sm font-semibold">${(price * 0.4).toLocaleString()}</p><p className="text-[11px] text-muted-foreground">40% Advance</p></div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.upfront_paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r.upfront_paid ? "✓ Paid" : "Pending"}</span>
                  </div>
                  <div className={`rounded-xl p-3 flex items-center justify-between ${r.final_paid ? "bg-emerald-50 border border-emerald-100" : "bg-muted/40 border border-border"}`}>
                    <div className="flex items-center gap-2">
                      {r.final_paid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                      <div><p className="text-sm font-semibold">${(price * 0.6).toLocaleString()}</p><p className="text-[11px] text-muted-foreground">60% Final</p></div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.final_paid ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{r.final_paid ? "✓ Paid" : "On delivery"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
