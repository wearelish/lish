import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, LifeBuoy, ChevronRight, CheckCircle } from "lucide-react";
import { SectionHeader, statusBadge } from "./shared";

const db = supabase as any;

export const ADSupport = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ["ad-tickets"],
    queryFn: async () => {
      const { data, error } = await db
        .from("support_tickets")
        .select("*, profiles!support_tickets_client_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  const { data: ticketMsgs = [] } = useQuery({
    queryKey: ["ad-ticket-msgs", activeTicket?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", activeTicket!.id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!activeTicket?.id,
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketMsgs]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeTicket?.id || !uid) return;
    setSending(true);
    const { error } = await db.from("ticket_messages").insert({
      ticket_id: activeTicket.id,
      sender_id: uid,
      body: reply.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setReply("");
    qc.invalidateQueries({ queryKey: ["ad-ticket-msgs", activeTicket.id] });
  };

  const resolveTicket = async (id: string) => {
    const { error } = await db
      .from("support_tickets")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket resolved");
    if (activeTicket?.id === id) setActiveTicket({ ...activeTicket, status: "resolved" });
    qc.invalidateQueries({ queryKey: ["ad-tickets"] });
  };

  const filtered = tickets.filter((t: any) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const openCount = tickets.filter((t: any) => t.status === "open").length;

  return (
    <div>
      <SectionHeader title="Support Tickets" subtitle={`${openCount} open ticket${openCount !== 1 ? "s" : ""}`} />

      <div className="flex gap-2 mb-4">
        {(["open", "all", "resolved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? "bg-rose-500 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[420px]">
        {/* Ticket list */}
        <div className="w-56 shrink-0 space-y-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-xs text-stone-400 px-2 py-3">No tickets.</p>
          )}
          {filtered.map((t: any) => (
            <button key={t.id} onClick={() => setActiveTicket(t)}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all flex items-center justify-between gap-1 ${activeTicket?.id === t.id ? "bg-rose-50 text-rose-600 border border-rose-100" : "text-stone-500 hover:bg-stone-50"}`}>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{t.title}</p>
                <p className="text-[10px] mt-0.5 text-stone-400">
                  {t.profiles?.full_name || t.profiles?.email || "Client"}
                </p>
                <p className="text-[10px] mt-0.5">{t.issue_type}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${t.status === "open" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {t.status}
                </span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Ticket detail */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <AnimatePresence mode="wait">
            {!activeTicket ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <LifeBuoy className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">Select a ticket to view and reply.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key={activeTicket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 bg-stone-50 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-stone-800">{activeTicket.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {activeTicket.profiles?.full_name || activeTicket.profiles?.email || "Client"} · {activeTicket.issue_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusBadge(activeTicket.status)}
                    {activeTicket.status === "open" && (
                      <Button onClick={() => resolveTicket(activeTicket.id)} size="sm"
                        className="h-7 px-2.5 rounded-lg bg-emerald-500 text-white border-0 text-xs gap-1">
                        <CheckCircle className="w-3 h-3" /> Resolve
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 py-3 border-b border-stone-100 bg-stone-50/50">
                  <p className="text-xs text-stone-600">{activeTicket.description}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {ticketMsgs.length === 0 && (
                    <p className="text-center text-xs text-stone-400 py-6">No replies yet. Respond to the client.</p>
                  )}
                  {ticketMsgs.map((m: any) => {
                    const isMe = m.sender_id === uid;
                    return (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-rose-500 text-white rounded-br-sm" : "bg-stone-100 text-stone-800 rounded-bl-sm"}`}>
                          <p>{m.body}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-stone-400"}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {activeTicket.status !== "resolved" && (
                  <form onSubmit={sendReply} className="p-3 border-t border-stone-100 flex gap-2">
                    <Input value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply to client..."
                      className="rounded-full h-10 flex-1" />
                    <Button type="submit" disabled={sending || !reply.trim()} size="icon"
                      className="rounded-full w-10 h-10 bg-rose-500 text-white border-0 shrink-0 hover:bg-rose-600">
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
