import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Clock, CreditCard, Plus, MessageSquare, LifeBuoy, CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./shared";
import type { CDSection } from "./ClientDashboard";

export const CDHome = ({ onNavigate }: { onNavigate: (s: CDSection) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-requests", uid],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("*").eq("client_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!uid,
  });

  const active = requests.filter((r: any) => r.status === "in_progress").length;
  const pending = requests.filter((r: any) => ["pending", "under_review"].includes(r.status)).length;
  const recent = requests.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-medium">Client Portal</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-gradient mt-1">Good day, {name} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your projects.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FolderOpen, label: "Active Projects", value: active, color: "text-blue-500", bg: "bg-blue-50", action: () => onNavigate("projects") },
          { icon: Clock, label: "Pending Review", value: pending, color: "text-amber-500", bg: "bg-amber-50", action: () => onNavigate("projects") },
          { icon: CreditCard, label: "Total Projects", value: requests.length, color: "text-rose-500", bg: "bg-rose-50", action: () => onNavigate("projects") },
          { icon: FolderOpen, label: "Completed", value: requests.filter((r: any) => r.status === "completed").length, color: "text-emerald-500", bg: "bg-emerald-50", action: () => onNavigate("projects") },
        ].map((c) => (
          <button key={c.label} onClick={c.action} className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}><c.icon className={`w-4 h-4 ${c.color}`} /></div>
            <div className="font-serif text-3xl font-semibold">{c.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{c.label}</div>
          </button>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-xl mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Plus, label: "New Request", action: () => onNavigate("new-request"), color: "bg-foreground text-background" },
            { icon: MessageSquare, label: "Messages", action: () => onNavigate("messages"), color: "bg-blue-500 text-white" },
            { icon: LifeBuoy, label: "Support", action: () => onNavigate("support"), color: "bg-rose-500 text-white" },
            { icon: CalendarDays, label: "Meetings", action: () => onNavigate("meetings"), color: "bg-purple-500 text-white" },
          ].map((a) => (
            <button key={a.label} onClick={a.action} className="glass-card rounded-2xl p-4 text-left hover:shadow-lg transition-all group">
              <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><a.icon className="w-4 h-4" /></div>
              <p className="font-medium text-sm">{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl">Recent Projects</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")} className="text-primary text-xs gap-1 h-7">View all <ArrowRight className="w-3 h-3" /></Button>
        </div>
        {recent.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-muted-foreground text-sm">No projects yet.</p>
            <Button size="sm" onClick={() => onNavigate("new-request")} className="mt-3 rounded-full bg-foreground text-background border-0 h-8 text-xs">Submit your first request</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((r: any) => (
              <button key={r.id} onClick={() => onNavigate("projects")} className="w-full glass-card rounded-2xl p-4 flex items-center justify-between gap-3 hover:shadow-md transition-all text-left">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={r.status} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
