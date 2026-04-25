import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { statusBadge, PageHeader, EmptyState } from "./shared";
import type { CDSection } from "./ClientDashboard";

const FILTERS = ["all", "pending", "in_progress", "completed", "rejected"];

export const CDProjects = ({ onNavigate }: { onNavigate: (s: CDSection) => void }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: requests = [] } = useQuery({
    queryKey: ["cd-projects", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("*").eq("client_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const filtered = filter === "all" ? requests : requests.filter((r: any) => r.status === filter);

  return (
    <div>
      <PageHeader title="Projects" subtitle="Track all your service requests and their progress." />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} text="No projects found." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any, i: number) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-strong rounded-2xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.deadline ? `Deadline: ${new Date(r.deadline).toLocaleDateString()}` : "No deadline set"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(r.status)}
                  {expanded === r.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              <AnimatePresence>
                {expanded === r.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                        <p className="text-sm">{r.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {r.budget && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Budget</p>
                            <p className="text-sm font-medium">${Number(r.budget).toLocaleString()}</p>
                          </div>
                        )}
                        {r.final_price && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Final Price</p>
                            <p className="text-sm font-medium text-primary">${Number(r.final_price).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onNavigate("messages")}
                        className="flex items-center gap-2 text-xs text-primary font-medium hover:underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Open chat
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
