import { useState } from "react";
import { motion } from "framer-motion";
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

const db = supabase as any;

export const CDNewRequest = ({ onNavigate }: { onNavigate: (s: CDSection) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "", meetingRequest: false });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      toast.error("You must be logged in to submit a request");
      return;
    }
    
    setSaving(true);

    const insertData = {
      client_id: uid,
      title: form.title.trim(),
      description: form.description.trim(),
      budget: form.budget ? Number(form.budget) : null,
      deadline: form.deadline || null,
      status: 'pending' as const, // Explicitly set initial status
    };

    console.log('[CDNewRequest] Submitting request:', insertData);

    // Insert service request with detailed error handling
    const { data: requestData, error: requestError } = await supabase
      .from("service_requests")
      .insert(insertData)
      .select()
      .single();
    
    if (requestError) {
      console.error('[CDNewRequest] Error:', requestError);
      setSaving(false);
      
      // Provide user-friendly error messages
      if (requestError.code === '42501') {
        toast.error("Permission denied. Please ensure you're logged in as a client.");
      } else if (requestError.message.includes('violates row-level security')) {
        toast.error("Unable to submit request. Please contact support.");
      } else {
        toast.error("Failed to submit request: " + requestError.message);
      }
      return;
    }

    console.log('[CDNewRequest] Request created:', requestData);

    // Insert meeting if requested (with error handling)
    if (form.meetingRequest) {
      const { error: meetingError } = await db.from("meetings").insert({
        client_id: uid,
        title: `Meeting for: ${form.title}`,
        description: "Requested alongside service submission.",
        status: 'pending',
      });
      
      if (meetingError) {
        console.warn('[CDNewRequest] Meeting error:', meetingError);
        // Don't fail the whole submission, just warn
        toast.warning("Request submitted, but meeting request failed");
      }
    }

    setSaving(false);
    setDone(true);
    toast.success("Request submitted successfully!");
    
    // Sync queries
    qc.invalidateQueries({ queryKey: ["ad-requests"] });
    qc.invalidateQueries({ queryKey: ["ad-requests-full"] });
    qc.invalidateQueries({ queryKey: ["cd-requests"] });
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="font-serif text-3xl text-gradient">Request Submitted!</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-xs">
          Our team will review your request and get back to you shortly.
        </p>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => { setDone(false); setForm({ title: "", description: "", budget: "", deadline: "", meetingRequest: false }); }}
            variant="outline" className="rounded-full">New Request</Button>
          <Button onClick={() => onNavigate("projects")} className="rounded-full bg-foreground text-background border-0">
            View Projects
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <PageHeader title="New Request" subtitle="Tell us what you need and we'll get back to you." />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 max-w-2xl">
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Project title <span className="text-destructive">*</span></Label>
            <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. E-commerce website redesign" className="rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you need, goals, references..." className="rounded-xl resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Budget (USD)</Label>
              <Input type="number" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                placeholder="e.g. 1500" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="rounded-xl h-11" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => setForm({ ...form, meetingRequest: !form.meetingRequest })}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.meetingRequest ? "bg-primary border-primary" : "border-border"}`}>
              {form.meetingRequest && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Also request a meeting with the team
            </span>
          </label>
          <Button type="submit" disabled={saving} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 h-11">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                Submitting...
              </span>
            ) : "Submit Request"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
