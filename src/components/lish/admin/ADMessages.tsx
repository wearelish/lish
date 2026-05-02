import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "./shared";

const db = supabase as any;

export const ADMessages = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // All requests that have messages or are active
  const { data: requests = [] } = useQuery({
    queryKey: ["ad-msg-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, title, status, client_id, profiles!service_requests_client_id_fkey(full_name, email)")
        .not("status", "in", '("rejected","cancelled")')
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (requests.length > 0 && !selectedReq) {
      setSelectedReq(requests[0].id);
    }
  }, [requests, selectedReq]);

  const { data: messages = [] } = useQuery({
    queryKey: ["ad-messages", selectedReq],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("request_id", selectedReq!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedReq,
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !selectedReq || !uid) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      request_id: selectedReq,
      sender_id: uid,
      body: msg.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setMsg("");
    qc.invalidateQueries({ queryKey: ["ad-messages", selectedReq] });
  };

  const selected = requests.find((r: any) => r.id === selectedReq);
  const clientName = (selected as any)?.profiles?.full_name || (selected as any)?.profiles?.email || "Client";

  if (requests.length === 0) {
    return (
      <div>
        <SectionHeader title="Messages" subtitle="Chat with clients about their projects." />
        <div className="bg-white rounded-2xl border border-stone-200 p-14 text-center">
          <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No active requests yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Messages" subtitle="Chat with clients about their projects." />

      <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[420px]">
        {/* Request list */}
        <div className="w-52 shrink-0 space-y-1 overflow-y-auto">
          {requests.map((r: any) => (
            <button key={r.id} onClick={() => setSelectedReq(r.id)}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all ${selectedReq === r.id ? "bg-rose-50 text-rose-600 border border-rose-100" : "text-stone-500 hover:bg-stone-50"}`}>
              <p className="truncate text-xs font-medium">{r.title}</p>
              <p className="text-[10px] mt-0.5 text-stone-400">
                {(r as any).profiles?.full_name || (r as any).profiles?.email || "Client"}
              </p>
              <p className={`text-[10px] mt-0.5 ${selectedReq === r.id ? "text-rose-400" : "text-stone-400"}`}>
                {r.status.replace(/_/g, " ")}
              </p>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
            <p className="font-semibold text-sm text-stone-800">{selected?.title ?? "Select a project"}</p>
            <p className="text-xs text-stone-400">{clientName}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-xs text-stone-400 py-8">No messages yet. Start the conversation.</p>
            )}
            {messages.map((m: any) => {
              const isMe = m.sender_id === uid;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
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

          <form onSubmit={send} className="p-3 border-t border-stone-100 flex gap-2">
            <Input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..."
              className="rounded-full h-10 flex-1" />
            <Button type="submit" disabled={sending || !msg.trim()} size="icon"
              className="rounded-full w-10 h-10 bg-rose-500 text-white border-0 shrink-0 hover:bg-rose-600">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
