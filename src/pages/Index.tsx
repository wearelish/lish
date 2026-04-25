import { motion } from "framer-motion";
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

const Spinner = () => (
  <div className="min-h-screen hero-bg flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
  </div>
);

export default function Index() {
  const { user, role, loading } = useAuth();

  // Still initializing — show spinner briefly
  if (loading) return <Spinner />;

  // Not logged in — landing page with Login + Join buttons
  if (!user) return <Landing />;

  // Logged in — go straight to correct dashboard, never show landing
  if (role === "admin") return (
    <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <AdminDashboard />
    </motion.div>
  );

  if (role === "employee") return (
    <motion.div key="employee" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <EmployeeDashboard />
    </motion.div>
  );

  // Client (default)
  return (
    <motion.div key="client" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <ClientDashboard />
    </motion.div>
  );
}
