import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LishLogo } from "@/components/lish/LishLogo";
import { LogOut } from "lucide-react";

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
        <Link to="/" className="flex items-center">
          <LishLogo className="h-8 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {!user && (
            <>
              <a href="/#services" className="hover:text-primary transition-colors">Services</a>
              <a href="/#how" className="hover:text-primary transition-colors">How it works</a>
            </>
          )}
          {user && role && (
            <span className="text-xs uppercase tracking-widest text-primary font-medium px-3 py-1 bg-primary/10 rounded-full">
              {role}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Button
              variant="outline" size="sm"
              onClick={handleSignOut}
              className="rounded-full gap-1.5 border-foreground/20 hover:bg-white/60"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-full">
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0">
                Join
              </Button>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};
