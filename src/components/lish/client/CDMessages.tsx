import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./shared";

export const CDMessages = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-msg-requests", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("id,title,status").eq("client_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => { if (requests.length > 0 && !selectedReq) setSelectedReq(requests[0].id); }, [requests]);

  const { data: messages = [] } = useQuery({
    queryKey: ["cd-messages", selectedReq],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("request_id", selectedReq!).order("created_at");
      return data ?? [];
    },
    enabled: !!selectedReq,
    refetchInterval: 8000,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !selectedReq || !user?.id) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ request_id: selectedReq, sender_id: user.id, body: msg.trim() });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setMsg("");
    qc.invalidateQueries({ queryKey: ["cd-messages", selectedReq] });
  };

  if (requests.length === 0) return (
    <div>
      <PageHeader title="Messages" subtitle="Chat with the LISH team about your projects." />
      <div className="glass-card rounded-3xl p-14 text-center"><MessageSquare className="w-10 h-10 text-primary/30 mx-auto mb-3" /><p className="text-muted-foreground text-sm">Submit a project request first to start chatting.</p></div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Messages" subtitle="Chat with the LISH team." />
      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
        <div className="w-48 sm:w-56 shrink-0 space-y-1 overflow-y-auto">
          {requests.map((r: any) => (
            <button key={r.id} onClick={() => setSelectedReq(r.id)} className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all ${selectedReq === r.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
              <p className="truncate text-xs font-medium">{r.title}</p>
              <p className="text-[10px] mt-0.5 text-muted-foreground">{r.status.replace(/_/g, " ")}</p>
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-medium text-sm">{requests.find((r: any) => r.id === selectedReq)?.title ?? "Select a project"}</p>
            <p className="text-xs text-muted-foreground">LISH Team</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No messages yet. Say hello!</p>}
            {messages.map((m: any) => {
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
          <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
            <Input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="rounded-full h-10 flex-1 bg-white/60" />
            <Button type="submit" disabled={sending || !msg.trim()} size="icon" className="rounded-full w-10 h-10 bg-foreground text-background border-0 shrink-0"><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
};
