import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LifeBuoy, Plus, Send, X } from "lucide-react";
import { PageHeader, StatusBadge } from "./shared";

const ISSUE_TYPES = ["Payment issue", "Delay in work", "Communication issue", "Refund request", "Other"];

export const CDSupport = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [form, setForm] = useState({ title: "", issue_type: "Other", description: "" });
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ["cd-tickets", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("support_tickets").select("*").eq("client_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: msgs = [] } = useQuery({
    queryKey: ["cd-ticket-msgs", activeTicket?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("ticket_messages").select("*").eq("ticket_id", activeTicket!.id).order("created_at");
      return data ?? [];
    },
    enabled: !!activeTicket?.id,
    refetchInterval: 5000,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    const { error } = await (supabase as any).from("support_tickets").insert({ client_id: user.id, ...form });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket raised!");
    setForm({ title: "", issue_type: "Other", description: "" });
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ["cd-tickets", user.id] });
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeTicket?.id || !user?.id) return;
    setSending(true);
    const { error } = await (supabase as any).from("ticket_messages").insert({ ticket_id: activeTicket.id, sender_id: user.id, body: reply.trim() });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setReply("");
    qc.invalidateQueries({ queryKey: ["cd-ticket-msgs", activeTicket.id] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageHeader title="Support" subtitle="Raise a ticket and we'll help you out." />
        <Button onClick={() => setShowForm(true)} className="rounded-full bg-foreground text-background border-0 gap-2 h-10 shrink-0"><Plus className="w-4 h-4" /> New Ticket</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-gradient">Raise a Support Ticket</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={submitTicket} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Issue type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ISSUE_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, issue_type: t })} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${form.issue_type === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5"><Label>Title *</Label><Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief summary" className="rounded-xl h-11" /></div>
              <div className="space-y-1.5"><Label>Description *</Label><Textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue..." className="rounded-xl resize-none" /></div>
              <Button type="submit" disabled={saving} className="w-full rounded-full bg-foreground text-background border-0 h-11">{saving ? "Submitting…" : "Submit Ticket"}</Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
        <div className="w-48 sm:w-56 shrink-0 space-y-1 overflow-y-auto">
          {tickets.length === 0 && <p className="text-xs text-muted-foreground px-2 py-3">No tickets yet.</p>}
          {tickets.map((t: any) => (
            <button key={t.id} onClick={() => setActiveTicket(t)} className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all ${activeTicket?.id === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <p className="truncate text-xs font-medium">{t.title}</p>
              <p className="text-[10px] mt-0.5">{t.issue_type}</p>
            </button>
          ))}
        </div>
        <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col">
          {!activeTicket ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center"><LifeBuoy className="w-10 h-10 text-primary/30 mx-auto mb-3" /><p className="text-muted-foreground text-sm">Select a ticket or raise a new one.</p></div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                <div><p className="font-medium text-sm">{activeTicket.title}</p><p className="text-xs text-muted-foreground mt-0.5">{activeTicket.issue_type}</p></div>
                <StatusBadge status={activeTicket.status} />
              </div>
              <div className="px-5 py-3 border-b border-border bg-muted/30"><p className="text-xs text-muted-foreground">{activeTicket.description}</p></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgs.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">No replies yet. We'll respond shortly.</p>}
                {msgs.map((m: any) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-foreground text-background rounded-br-sm" : "bg-white border border-border rounded-bl-sm"}`}>
                        <p>{m.body}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-background/50" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              {activeTicket.status !== "resolved" && (
                <form onSubmit={sendReply} className="p-3 border-t border-border flex gap-2">
                  <Input value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply..." className="rounded-full h-10 flex-1 bg-white/60" />
                  <Button type="submit" disabled={sending || !reply.trim()} size="icon" className="rounded-full w-10 h-10 bg-foreground text-background border-0 shrink-0"><Send className="w-4 h-4" /></Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
