import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Inbox } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const statusColor: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  negotiating: "bg-accent text-accent-foreground",
  accepted: "bg-primary/20 text-primary",
  in_progress: "bg-primary text-primary-foreground",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export const ClientDash = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "" });
  const [saving, setSaving] = useState(false);

  const { data: requests = [], refetch } = useQuery({
    queryKey: ["client-requests", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("service_requests").insert({
      client_id: user.id,
      title: form.title,
      description: form.description,
      budget: form.budget ? Number(form.budget) : null,
      deadline: form.deadline || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Request submitted!");
    setForm({ title: "", description: "", budget: "", deadline: "" });
    setOpen(false);
    refetch();
  };

  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs uppercase tracking-widest text-primary font-medium">Client Portal</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-gradient mt-1">Hey, {name} 👋</h1>
        <p className="text-muted-foreground mt-2 text-sm">Here's your workspace. Submit a request to get started.</p>
      </motion.div>

      {/* Action bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 h-11 px-6 gap-2">
              <Plus className="w-4 h-4" /> Request a Service
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong rounded-3xl border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-gradient">New Service Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Project title</Label>
                <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Landing page redesign" className="rounded-xl focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what you need..." className="rounded-xl resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Budget (USD)</Label>
                  <Input type="number" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="500" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Deadline</Label>
                  <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white border-0 h-11">
                {saving ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Requests list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-3">
        <h2 className="font-serif text-xl text-foreground">Your Requests</h2>
        {requests.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Inbox className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No requests yet. Submit one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-strong rounded-2xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{r.description}</p>
                  {r.budget && <p className="text-xs text-primary mt-1">${r.budget.toLocaleString()}</p>}
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColor[r.status] ?? "bg-muted text-muted-foreground"}`}>
                  {r.status.replace("_", " ")}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
