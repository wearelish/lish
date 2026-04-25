import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LifeBuoy, Plus, Send, ChevronRight } from "lucide-react";
import { statusBadge, EmptyState } from "./shared";

const db = supabase as any;
const ISSUE_TYPES = ["Payment issue", "Delay in work", "Communication issue", "Refund request", "Other"];

export const CDSupport = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [form, setForm] = useState({ title: "", issue_type: "Other", description: "" });
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ["cd-tickets", uid],
    queryFn: async () => {
      const { data, error } = await db.from("support_tickets")
        .select("*").eq("client_id", uid!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!uid,
  });

  const { data: ticketMsgs = [] } = useQuery({
    queryKey: ["cd-ticket-msgs", activeTicket?.id],
    queryFn: async () => {
      const { data, error } = await db.from("ticket_messages")
        .select("*").eq("ticket_id", activeTicket!.id).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!activeTicket?.id,
    refetchInterval: 4000,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticketMsgs]);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    const { error } = await db.from("support_tickets").insert({ client_id: uid, ...form });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket raised!");
    setForm({ title: "", issue_type: "Other", description: "" });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["cd-tickets", uid] });
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeTicket?.id || !uid) return;
    setSending(true);
    const { error } = await db.from("ticket_messages").insert({
      ticket_id: activeTicket.id, sender_id: uid, body: reply.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setReply("");
    qc.invalidateQueries({ queryKey: ["cd-ticket-msgs", activeTicket.id] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-gradient">Support</h1>
          <p className="text-muted-foreground text-sm mt-1">Raise a ticket and we'll help you out.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-foreground text-background border-0 gap-2 h-10">
              <Plus className="w-4 h-4" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong rounded-3xl border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-gradient">Raise a Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitTicket} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Issue type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ISSUE_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, issue_type: t })}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${form.issue_type === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief summary" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue..." className="rounded-xl resize-none" />
              </div>
              <Button type="submit" disabled={saving} className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white border-0 h-11">
                {saving ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
        {/* Ticket list */}
        <div className="w-48 sm:w-56 shrink-0 space-y-1 overflow-y-auto">
          {tickets.length === 0 && <p className="text-xs text-muted-foreground px-2 py-3">No tickets yet.</p>}
          {tickets.map((t: any) => (
            <button key={t.id} onClick={() => setActiveTicket(t)}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all flex items-center justify-between gap-1 ${activeTicket?.id === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{t.title}</p>
                <p className="text-[10px] mt-0.5">{t.issue_type}</p>
              </div>
              <ChevronRight className="w-3 h-3 shrink-0" />
            </button>
          ))}
        </div>

        {/* Ticket detail */}
        <div className="flex-1 glass-strong rounded-2xl overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {!activeTicket ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center p-8">
                <EmptyState icon={LifeBuoy} text="Select a ticket or raise a new one." />
              </motion.div>
            ) : (
              <motion.div key={activeTicket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{activeTicket.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activeTicket.issue_type}</p>
                  </div>
                  {statusBadge(activeTicket.status)}
                </div>
                <div className="px-5 py-3 border-b border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground">{activeTicket.description}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {ticketMsgs.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-6">No replies yet. We'll respond shortly.</p>
                  )}
                  {ticketMsgs.map((m: any) => {
                    const isMe = m.sender_id === uid;
                    return (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-foreground text-background rounded-br-sm" : "bg-white border border-border rounded-bl-sm"}`}>
                          <p>{m.body}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-background/50" : "text-muted-foreground"}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                {activeTicket.status !== "resolved" && (
                  <form onSubmit={sendReply} className="p-3 border-t border-border flex gap-2">
                    <Input value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply..."
                      className="rounded-full h-10 flex-1 bg-white/60" />
                    <Button type="submit" disabled={sending || !reply.trim()} size="icon"
                      className="rounded-full w-10 h-10 bg-foreground text-background border-0 shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
