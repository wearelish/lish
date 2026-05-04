import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Video } from "lucide-react";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

export const ADMeetings = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [meetLink, setMeetLink] = useState("");

  const { data: meetings = [] } = useQuery({
    queryKey: ["ad-meetings"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("meetings").select("*, profiles!meetings_client_id_fkey(full_name, email)").order("created_at", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const update = async (id: string, updates: any) => {
    const { error } = await (supabase as any).from("meetings").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Meeting updated");
    setEditing(null); setScheduleAt(""); setMeetLink("");
    qc.invalidateQueries({ queryKey: ["ad-meetings"] });
  };

  return (
    <div>
      <SectionHeader title="Meeting Requests" subtitle={`${meetings.filter((m: any) => m.status === "pending").length} pending`} />
      <Table headers={["Client", "Topic", "Requested", "Scheduled", "Meet Link", "Status", "Actions"]} empty={meetings.length === 0}>
        {meetings.map((m: any) => (
          <TR key={m.id}>
            <TD><p className="font-medium text-sm">{m.profiles?.full_name || m.profiles?.email || "—"}</p></TD>
            <TD><p className="font-medium max-w-[140px] truncate">{m.title}</p></TD>
            <TD className="text-xs text-stone-400">{m.requested_at ? new Date(m.requested_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : new Date(m.created_at).toLocaleDateString()}</TD>
            <TD className="text-xs">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : <span className="text-stone-400">Not set</span>}</TD>
            <TD>{m.meet_link ? <a href={m.meet_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline"><Video className="w-3 h-3" /> Join</a> : <span className="text-stone-400 text-xs">—</span>}</TD>
            <TD>{statusBadge(m.status)}</TD>
            <TD>
              {editing === m.id ? (
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} className="h-7 text-xs rounded-lg" />
                  <Input value={meetLink} onChange={e => setMeetLink(e.target.value)} className="h-7 text-xs rounded-lg" placeholder="Meet link (optional)" />
                  <div className="flex gap-1">
                    <Button onClick={() => update(m.id, { status: "scheduled", scheduled_at: scheduleAt || null, meet_link: meetLink || null })} size="sm" className="h-7 px-2 rounded-lg bg-emerald-500 text-white border-0 text-xs flex-1">Schedule</Button>
                    <Button onClick={() => setEditing(null)} size="sm" variant="ghost" className="h-7 px-2 rounded-lg text-xs">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5 flex-wrap">
                  {m.status !== "completed" && (
                    <>
                      <button onClick={() => { setEditing(m.id); setScheduleAt(m.scheduled_at?.slice(0, 16) ?? ""); setMeetLink(m.meet_link ?? ""); }} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-all">{m.status === "pending" ? "Schedule" : "Edit"}</button>
                      <button onClick={() => update(m.id, { status: "completed" })} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition-all">Done</button>
                    </>
                  )}
                </div>
              )}
            </TD>
          </TR>
        ))}
      </Table>
    </div>
  );
};
