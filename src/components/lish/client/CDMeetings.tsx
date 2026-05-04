import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarDays, Plus, Video, X } from "lucide-react";
import { PageHeader, StatusBadge } from "./shared";

export const CDMeetings = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", requested_at: "" });
  const [saving, setSaving] = useState(false);

  const { data: meetings = [] } = useQuery({
    queryKey: ["cd-meetings", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("meetings").select("*").eq("client_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    const { error } = await (supabase as any).from("meetings").insert({ client_id: user.id, title: form.title, description: form.description || null, requested_at: form.requested_at || null });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Meeting requested!");
    setForm({ title: "", description: "", requested_at: "" });
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ["cd-meetings", user.id] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageHeader title="Meetings" subtitle="Request and manage meetings with the team." />
        <Button onClick={() => setShowForm(true)} className="rounded-full bg-foreground text-background border-0 gap-2 h-10 shrink-0"><Plus className="w-4 h-4" /> Request Meeting</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-gradient">Request a Meeting</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5"><Label>Topic *</Label><Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Project kickoff" className="rounded-xl h-11" /></div>
              <div className="space-y-1.5"><Label>Preferred date & time</Label><Input type="datetime-local" value={form.requested_at} onChange={e => setForm({ ...form, requested_at: e.target.value })} className="rounded-xl h-11" /></div>
              <div className="space-y-1.5"><Label>Notes (optional)</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Anything you'd like to discuss..." className="rounded-xl resize-none" /></div>
              <Button type="submit" disabled={saving} className="w-full rounded-full bg-foreground text-background border-0 h-11">{saving ? "Requesting…" : "Request Meeting"}</Button>
            </form>
          </div>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="glass-card rounded-3xl p-14 text-center"><CalendarDays className="w-10 h-10 text-primary/30 mx-auto mb-3" /><p className="text-muted-foreground text-sm">No meetings yet. Request one above.</p></div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m: any) => (
            <div key={m.id} className="glass-card rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm">{m.title}</p>
                {m.scheduled_at && <p className="text-xs text-muted-foreground mt-1">Scheduled: {new Date(m.scheduled_at).toLocaleString()}</p>}
                {m.requested_at && !m.scheduled_at && <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(m.requested_at).toLocaleString()}</p>}
                {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                {m.meet_link && <a href={m.meet_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"><Video className="w-3 h-3" /> Join meeting</a>}
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
