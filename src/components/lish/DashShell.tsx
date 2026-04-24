import { ReactNode } from "react";
import { Navbar } from "@/components/lish/Navbar";
import { motion } from "framer-motion";

export const DashShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <div className="min-h-screen hero-bg">
    <Navbar />
    <main className="max-w-6xl mx-auto px-6 pt-32 pb-16">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-serif text-4xl sm:text-5xl text-gradient">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </main>
  </div>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: "bg-secondary text-secondary-foreground",
    negotiating: "bg-accent text-accent-foreground",
    accepted: "bg-primary/20 text-primary",
    rejected: "bg-destructive/15 text-destructive",
    in_progress: "bg-primary text-primary-foreground",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-muted text-muted-foreground",
    todo: "bg-secondary text-secondary-foreground",
    done: "bg-emerald-100 text-emerald-700",
    approved: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </span>
  );
};