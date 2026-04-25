import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/lish/Navbar";
import { LandingView } from "@/components/lish/LandingView";
import { ClientDashboard } from "@/components/lish/client/ClientDashboard";
import { AdminDashboard } from "../components/lish/admin/AdminDashboard";
import { EmployeeDashboard } from "../components/lish/employee/EmployeeDashboard";

const Landing = () => (
  <div className="min-h-screen hero-bg relative overflow-x-hidden">
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-[hsl(var(--accent))] opacity-40 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-[hsl(var(--secondary))] opacity-50 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
    </div>
    <Navbar />
    <LandingView />
  </div>
);

export default function Index() {
  const { user, role, loading } = useAuth();

  // Not logged in — show landing immediately, no spinner
  if (!user) return <Landing />;

  // Logged in but role still loading — show small inline spinner, not full screen
  if (loading || role === null) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (role === "admin") return (
    <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <AdminDashboard />
    </motion.div>
  );

  if (role === "employee") return (
    <motion.div key="employee" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <EmployeeDashboard />
    </motion.div>
  );

  return (
    <motion.div key="client" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <ClientDashboard />
    </motion.div>
  );
}
