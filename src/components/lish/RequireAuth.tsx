import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";

export const RequireAuth = ({
  children,
  role,
}: {
  children: ReactNode;
  role?: AppRole;
}) => {
  const { user, role: userRole, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-bg">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to={`/dashboard/${userRole ?? "client"}`} replace />;
  return <>{children}</>;
};