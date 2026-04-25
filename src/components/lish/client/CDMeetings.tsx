import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarDays, Plus, Video } from "lucide-react";
import { statusBadge, EmptyState } from "./shared";

const db = supabase as any;

export const CDMeetings = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", requested_at: "" });
  const [saving, setSaving] = useState(false);

  const { data: meetings = [] } = useQuery({
    queryKey: ["cd-meetings", uid],
    queryFn: async () => {
      const { data, error } = await db.from("meetings")
        .select("*").eq("client_id", uid!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    const { error } = await db.from("meetings").insert({
      client_id: uid,
      title: form.title,
      description: form.description || null,
      requested_at: form.requested_at || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Meeting requested!");
    setForm({ title: "", description: "", requested_at: "" });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["cd-meetings", uid] });
  };

  const upcoming = meetings.filter((m: any) => m.status !== "completed");
  const past = meetings.filter((m: any) => m.status === "completed");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-gradient">Meetings</h1>
          <p className="text-muted-foreground text-sm mt-1">Request and manage your meetings with the team.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-foreground text-background border-0 gap-2 h-10">
              <Plus className="w-4 h-4" /> Request Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong rounded-3xl border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-gradient">Request a Meeting</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Topic <span className="text-destructive">*</span></Label>
                <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Project kickoff" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred date & time</Label>
                <Input type="datetime-local" value={form.requested_at} onChange={e => setForm({ ...form, requested_at: e.target.value })}
                  className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Anything you'd like to discuss..." className="rounded-xl resize-none" />
              </div>
              <Button type="submit" disabled={saving} className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white border-0 h-11">
                {saving ? "Requesting..." : "Request Meeting"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-lg mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} text="No upcoming meetings. Request one above." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((m: any, i: number) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-strong rounded-2xl p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{m.title}</p>
                    {m.scheduled_at && <p className="text-xs text-muted-foreground mt-1">Scheduled: {new Date(m.scheduled_at).toLocaleString()}</p>}
                    {m.requested_at && !m.scheduled_at && <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(m.requested_at).toLocaleString()}</p>}
                    {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                    {m.meet_link && (
                      <a href={m.meet_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                        <Video className="w-3 h-3" /> Join meeting
                      </a>
                    )}
                  </div>
                  {statusBadge(m.status)}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div>
            <h2 className="font-serif text-lg mb-3 text-muted-foreground">Past Meetings</h2>
            <div className="space-y-3 opacity-60">
              {past.map((m: any) => (
                <div key={m.id} className="glass rounded-2xl p-4 flex items-center justify-between gap-4">
                  <p className="text-sm">{m.title}</p>
                  {statusBadge(m.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
