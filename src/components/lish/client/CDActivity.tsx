import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Activity, FileText, CalendarDays } from "lucide-react";
import { EmptyState, PageHeader } from "./shared";

const db = supabase as any;

export const CDActivity = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-activity-req", uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, title, status, created_at, updated_at")
        .eq("client_id", uid!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["cd-activity-meet", uid],
    queryFn: async () => {
      const { data, error } = await db.from("meetings")
        .select("id, title, status, created_at")
        .eq("client_id", uid!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const events = [
    ...requests.map((r: any) => ({
      id: r.id + "-req",
      icon: FileText,
      color: "bg-blue-50 text-blue-500",
      title: r.title,
      desc: `Request ${r.status.replace(/_/g, " ")}`,
      time: r.updated_at ?? r.created_at,
    })),
    ...meetings.map((m: any) => ({
      id: m.id + "-meet",
      icon: CalendarDays,
      color: "bg-purple-50 text-purple-500",
      title: m.title,
      desc: `Meeting ${m.status}`,
      time: m.created_at,
    })),
  ].sort((a, b) => {
    const ta = a.time ? new Date(a.time).getTime() : 0;
    const tb = b.time ? new Date(b.time).getTime() : 0;
    return tb - ta;
  });

  return (
    <div>
      <PageHeader title="Activity" subtitle="A chronological log of everything on your account." />

      {events.length === 0 ? (
        <EmptyState icon={Activity} text="No activity yet. Submit a request to get started." />
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4 pl-14">
            {events.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="relative">
                <div className={`absolute -left-9 w-8 h-8 rounded-full ${e.color} flex items-center justify-center`}>
                  <e.icon className="w-3.5 h-3.5" />
                </div>
                <div className="glass-strong rounded-2xl p-4">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.desc}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {e.time ? new Date(e.time).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
