import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 pt-4"
    >
      <nav className="glass max-w-6xl mx-auto rounded-3xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold text-gradient tracking-tight">LISH</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/#services" className="hover:text-primary transition-colors">Services</a>
          <a href="/#how" className="hover:text-primary transition-colors">How it works</a>
          {user && role && (
            <NavLink to={`/dashboard/${role}`} className="hover:text-primary transition-colors">
              Dashboard
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full">
              Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-full">
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0 shadow-[var(--shadow-soft)]">
                Join
              </Button>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};