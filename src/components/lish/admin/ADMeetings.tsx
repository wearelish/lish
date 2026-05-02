import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CalendarDays, Video } from "lucide-react";
import { SectionHeader, statusBadge, Table, TR, TD } from "./shared";

const db = supabase as any;

export const ADMeetings = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [meetLink, setMeetLink] = useState("");

  const { data: meetings = [] } = useQuery({
    queryKey: ["ad-meetings"],
    queryFn: async () => {
      const { data, error } = await db
        .from("meetings")
        .select("*, profiles!meetings_client_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const updateMeeting = async (id: string, updates: Record<string, any>) => {
    const { error } = await db.from("meetings").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Meeting updated");
    setEditing(null);
    setScheduleAt("");
    setMeetLink("");
    qc.invalidateQueries({ queryKey: ["ad-meetings"] });
  };

  const pending = meetings.filter((m: any) => m.status === "pending").length;

  return (
    <div>
      <SectionHeader title="Meeting Requests" subtitle={`${pending} pending request${pending !== 1 ? "s" : ""}`} />

      <Table
        headers={["Client", "Topic", "Requested", "Scheduled", "Meet Link", "Status", "Actions"]}
        empty={meetings.length === 0}
      >
        {meetings.map((m: any) => (
          <TR key={m.id}>
            <TD>
              <p className="font-medium text-sm">{m.profiles?.full_name || m.profiles?.email || "—"}</p>
            </TD>
            <TD>
              <p className="font-medium max-w-[160px] truncate">{m.title}</p>
              {m.description && <p className="text-[10px] text-stone-400 truncate max-w-[160px]">{m.description}</p>}
            </TD>
            <TD className="text-xs text-stone-400">
              {m.requested_at ? new Date(m.requested_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : new Date(m.created_at).toLocaleDateString()}
            </TD>
            <TD className="text-xs">
              {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : <span className="text-stone-400">Not set</span>}
            </TD>
            <TD>
              {m.meet_link ? (
                <a href={m.meet_link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                  <Video className="w-3 h-3" /> Join
                </a>
              ) : <span className="text-stone-400 text-xs">—</span>}
            </TD>
            <TD>{statusBadge(m.status)}</TD>
            <TD>
              {editing === m.id ? (
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={e => setScheduleAt(e.target.value)}
                    className="h-7 text-xs rounded-lg"
                    placeholder="Schedule date/time"
                  />
                  <Input
                    value={meetLink}
                    onChange={e => setMeetLink(e.target.value)}
                    className="h-7 text-xs rounded-lg"
                    placeholder="Meet link (optional)"
                  />
                  <div className="flex gap-1">
                    <Button
                      onClick={() => updateMeeting(m.id, {
                        status: "scheduled",
                        scheduled_at: scheduleAt || null,
                        meet_link: meetLink || null,
                      })}
                      size="sm" className="h-7 px-2 rounded-lg bg-emerald-500 text-white border-0 text-xs flex-1">
                      Schedule
                    </Button>
                    <Button onClick={() => setEditing(null)} size="sm" variant="ghost" className="h-7 px-2 rounded-lg text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5 flex-wrap">
                  {m.status !== "completed" && (
                    <>
                      <button
                        onClick={() => { setEditing(m.id); setScheduleAt(m.scheduled_at?.slice(0, 16) ?? ""); setMeetLink(m.meet_link ?? ""); }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-all">
                        {m.status === "pending" ? "Schedule" : "Edit"}
                      </button>
                      <button
                        onClick={() => updateMeeting(m.id, { status: "completed" })}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition-all">
                        Done
                      </button>
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
