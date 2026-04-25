import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Clock, CreditCard, Activity, ArrowRight, Plus, MessageSquare, LifeBuoy, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CDSection } from "./ClientDashboard";

const db = supabase as any;

export const CDHome = ({ onNavigate }: { onNavigate: (s: CDSection) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-requests", uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests").select("*").eq("client_id", uid!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const reqIds = requests.map((r: any) => r.id);

  const { data: messages = [] } = useQuery({
    queryKey: ["cd-home-msgs", uid, reqIds.join(",")],
    queryFn: async () => {
      if (!reqIds.length) return [];
      const { data } = await supabase
        .from("messages")
        .select("id, body, created_at, request_id, service_requests(title)")
        .in("request_id", reqIds)
        .neq("sender_id", uid!)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!uid && reqIds.length > 0,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["cd-home-tickets", uid],
    queryFn: async () => {
      const { data } = await db.from("support_tickets")
        .select("id, title, status").eq("client_id", uid!).eq("status", "open").limit(3);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const active = requests.filter((r: any) => r.status === "in_progress").length;
  const pending = requests.filter((r: any) => r.status === "pending").length;
  const recent = requests.slice(0, 3);

  const statCards = [
    { icon: FolderOpen, label: "Active Projects", value: active, color: "text-blue-500", bg: "bg-blue-50", action: () => onNavigate("projects") },
    { icon: Clock, label: "Pending Requests", value: pending, color: "text-amber-500", bg: "bg-amber-50", action: () => onNavigate("projects") },
    { icon: CreditCard, label: "Payments Due", value: 0, color: "text-rose-500", bg: "bg-rose-50", action: () => onNavigate("payments") },
    { icon: Activity, label: "Total Projects", value: requests.length, color: "text-emerald-500", bg: "bg-emerald-50", action: () => onNavigate("activity") },
  ];

  const quickActions = [
    { icon: Plus, label: "New Request", desc: "Submit a new project", action: () => onNavigate("new-request"), color: "bg-foreground text-background" },
    { icon: MessageSquare, label: "Messages", desc: "Chat with the team", action: () => onNavigate("messages"), color: "bg-blue-500 text-white" },
    { icon: LifeBuoy, label: "Support", desc: "Raise a ticket", action: () => onNavigate("support"), color: "bg-rose-500 text-white" },
    { icon: CalendarDays, label: "Meetings", desc: "Schedule a call", action: () => onNavigate("meetings"), color: "bg-purple-500 text-white" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-primary font-medium">Client Portal</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-gradient mt-1">Good day, {name} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your projects.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <motion.button key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            onClick={c.action} className="glass-strong rounded-2xl p-5 text-left hover:shadow-[var(--shadow-soft)] transition-all">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="font-serif text-3xl font-semibold text-foreground">{c.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{c.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-serif text-xl mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
              onClick={a.action} className="glass-strong rounded-2xl p-4 text-left hover:shadow-[var(--shadow-soft)] transition-all group">
              <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <a.icon className="w-4 h-4" />
              </div>
              <p className="font-medium text-sm">{a.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent projects */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent Projects</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")} className="text-primary text-xs gap-1 h-7">
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          {recent.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm">No projects yet.</p>
              <Button size="sm" onClick={() => onNavigate("new-request")} className="mt-3 rounded-full bg-foreground text-background border-0 h-8 text-xs">
                Submit your first request
              </Button>
            </div>
          ) : recent.map((r: any) => (
            <div key={r.id} className="glass-strong rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                r.status === "in_progress" ? "bg-primary text-white" :
                r.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>{r.status.replace(/_/g, " ")}</span>
            </div>
          ))}
        </motion.div>

        {/* Messages & Support */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Messages & Support</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("messages")} className="text-primary text-xs gap-1 h-7">
              Open chat <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          {messages.length === 0 && tickets.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-primary/30 mx-auto" />
              <p className="text-muted-foreground text-sm">No messages yet.</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => onNavigate("messages")} className="rounded-full h-8 text-xs">Messages</Button>
                <Button size="sm" variant="outline" onClick={() => onNavigate("support")} className="rounded-full h-8 text-xs">Support</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((m: any) => (
                <button key={m.id} onClick={() => onNavigate("messages")}
                  className="w-full glass-strong rounded-2xl p-3 text-left hover:shadow-[var(--shadow-soft)] transition-all">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{(m as any).service_requests?.title ?? "Project"}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{m.body}</p>
                    </div>
                  </div>
                </button>
              ))}
              {tickets.map((t: any) => (
                <button key={t.id} onClick={() => onNavigate("support")}
                  className="w-full glass-strong rounded-2xl p-3 text-left hover:shadow-[var(--shadow-soft)] transition-all">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                      <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Open ticket</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
