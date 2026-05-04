import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/lish/Navbar";
import { LandingView } from "@/components/lish/LandingView";
import { ClientDashboard } from "@/components/lish/client/ClientDashboard";
import { AdminDashboard } from "@/components/lish/admin/AdminDashboard";
import { EmployeeDashboard } from "@/components/lish/employee/EmployeeDashboard";

const Spinner = () => (
  <div className="min-h-screen hero-bg flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
  </div>
);

export default function Index() {
  const { user, role, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return (
    <div className="min-h-screen hero-bg relative overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-accent opacity-40 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-secondary opacity-50 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>
      <Navbar />
      <LandingView />
    </div>
  );
  if (role === "admin") return <AdminDashboard />;
  if (role === "employee") return <EmployeeDashboard />;
  return <ClientDashboard />;
}
