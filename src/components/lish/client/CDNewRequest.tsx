import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "./shared";
import type { CDSection } from "./ClientDashboard";

export const CDNewRequest = ({ onNavigate }: { onNavigate: (s: CDSection) => void }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "", meeting: false });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { toast.error("You must be logged in"); return; }
    setSaving(true);
    const { error } = await supabase.from("service_requests").insert({
      client_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      budget: form.budget ? Number(form.budget) : null,
      deadline: form.deadline || null,
      status: "pending",
    });
    if (error) { toast.error(error.message); setSaving(false); return; }
    if (form.meeting) {
      await (supabase as any).from("meetings").insert({ client_id: user.id, title: `Meeting for: ${form.title}`, status: "pending" });
    }
    setSaving(false);
    setDone(true);
    qc.invalidateQueries({ queryKey: ["cd-requests"] });
    qc.invalidateQueries({ queryKey: ["ad-requests"] });
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="font-serif text-3xl text-gradient">Request Submitted!</h2>
      <p className="text-foreground font-medium mt-3 text-base">Your request has been submitted. Admin will respond within 12–24 hours.</p>
      <p className="text-muted-foreground mt-2 text-sm max-w-xs">You'll be notified once a proposal is ready.</p>
      <div className="flex gap-3 mt-8">
        <Button onClick={() => { setDone(false); setForm({ title: "", description: "", budget: "", deadline: "", meeting: false }); }} variant="outline" className="rounded-full">Submit Another</Button>
        <Button onClick={() => onNavigate("projects")} className="rounded-full bg-foreground text-background border-0">View My Projects</Button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="New Request" subtitle="Tell us what you need and we'll get back to you within 12–24 hours." />
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl">
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Project title *</Label>
            <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. E-commerce website redesign" className="rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what you need, goals, references..." className="rounded-xl resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Budget (USD)</Label>
              <Input type="number" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 1500" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="rounded-xl h-11" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.meeting} onChange={e => setForm({ ...form, meeting: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-muted-foreground">Also request a meeting with the team</span>
          </label>
          <Button type="submit" disabled={saving} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 h-11">
            {saving ? "Submitting…" : "Submit Request"}
          </Button>
        </form>
      </div>
    </div>
  );
};
