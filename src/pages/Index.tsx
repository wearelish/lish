import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/lish/Navbar";
import { LandingView } from "@/components/lish/LandingView";
import { ClientDashboard } from "@/components/lish/client/ClientDashboard";

// Lazy-ish inline wrappers to avoid TS module resolution cache issues
import { AdminDashboard } from "../components/lish/admin/AdminDashboard";
import { EmployeeDashboard } from "../components/lish/employee/EmployeeDashboard";

const Spinner = () => (
  <div className="min-h-screen hero-bg flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
  </div>
);

export default function Index() {
  const { user, role, loading } = useAuth();

  // Show spinner while auth + role are loading
  if (loading) return <Spinner />;

  // Logged in but role not yet fetched — wait
  if (user && role === null) return <Spinner />;

  // Client: full-screen sidebar app
  if (user && role === "client") {
    return (
      <motion.div key="client" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <ClientDashboard />
      </motion.div>
    );
  }

  // Admin / Employee: overlay dashboard on landing bg
  if (user && role === "admin") {
    return (
      <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <AdminDashboard />
      </motion.div>
    );
  }

  if (user && role === "employee") {
    return (
      <motion.div key="employee" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <EmployeeDashboard />
      </motion.div>
    );
  }
  return (
    <div className="min-h-screen hero-bg relative overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-[hsl(var(--accent))] opacity-40 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-[hsl(var(--secondary))] opacity-50 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
          transition={{ duration: 0.5 }}
        >
          <LandingView />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
