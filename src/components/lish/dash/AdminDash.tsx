import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FileText, Users, Layers, Clock } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  negotiating: "bg-accent text-accent-foreground",
  accepted: "bg-primary/20 text-primary",
  in_progress: "bg-primary text-primary-foreground",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export const AdminDash = () => {
  const { user } = useAuth();

  const { data: requests = [] } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id").eq("role", "employee");
      return data ?? [];
    },
    enabled: !!user,
  });

  const active = requests.filter((r: any) => r.status === "in_progress").length;
  const pending = requests.filter((r: any) => r.status === "pending").length;

  const cards = [
    { icon: FileText, label: "Total Requests", value: requests.length },
    { icon: Layers, label: "Active Projects", value: active },
    { icon: Clock, label: "Pending Review", value: pending },
    { icon: Users, label: "Employees", value: employees.length },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs uppercase tracking-widest text-primary font-medium">Admin Dashboard</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-gradient mt-1">Overview</h1>
        <p className="text-muted-foreground mt-2 text-sm">Manage requests, employees, and projects.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="glass-strong rounded-2xl p-5"
          >
            <c.icon className="w-5 h-5 text-primary mb-3" />
            <div className="font-serif text-3xl font-semibold text-gradient">{c.value}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{c.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Incoming requests */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="space-y-3">
        <h2 className="font-serif text-xl text-foreground">Incoming Requests</h2>
        {requests.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <FileText className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 10).map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-strong rounded-2xl p-5 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{r.title}</p>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{r.description}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
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
