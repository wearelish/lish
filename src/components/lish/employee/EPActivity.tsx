import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CheckSquare, Calendar } from "lucide-react";

export const EPActivity = ({ checkedIn: _ }: { checkedIn: boolean }) => {
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery({
    queryKey: ["ep-act-tasks", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*, service_requests(title)").eq("employee_id", user!.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["ep-act-att", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("attendance").select("*").eq("employee_id", user!.id).order("check_in_date", { ascending: false }).limit(30);
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const events = [
    ...tasks.map((t: any) => ({ id: t.id + "-t", icon: CheckSquare, color: "bg-blue-50 text-blue-500", title: t.title, desc: `Task ${t.status.replace(/_/g, " ")} — ${(t as any).service_requests?.title ?? ""}`, time: t.updated_at ?? t.created_at })),
    ...attendance.map((a: any) => ({ id: a.id + "-a", icon: Calendar, color: "bg-emerald-50 text-emerald-500", title: "Attendance", desc: `Checked in on ${a.check_in_date}`, time: a.checked_in_at })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-stone-800">Activity Log</h1><p className="text-sm text-stone-500 mt-0.5">Your recent activity.</p></div>
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center"><p className="text-stone-400 text-sm">No activity yet.</p></div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-stone-100" />
          <div className="space-y-4 pl-14">
            {events.map((e) => (
              <div key={e.id} className="relative">
                <div className={`absolute -left-9 w-8 h-8 rounded-full ${e.color} flex items-center justify-center`}><e.icon className="w-3.5 h-3.5" /></div>
                <div className="bg-white rounded-2xl border border-stone-100 p-4">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{e.desc}</p>
                  <p className="text-[11px] text-stone-400 mt-2">{new Date(e.time).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
