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
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 pt-4"
    >
      <nav
        className="max-w-5xl mx-auto px-5 py-2.5 flex items-center justify-between"
        style={{
          borderRadius: "2rem",
          background: "rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.55)",
          boxShadow:
            "0 4px 24px -4px rgba(200, 150, 150, 0.18), 0 1.5px 0 0 rgba(255,255,255,0.7) inset, 0 -1px 0 0 rgba(200,150,150,0.12) inset",
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <LishLogo className="h-8 w-auto" />
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          {!user ? (
            <>
              {[
                { label: "Services", href: "/#services" },
                { label: "How it works", href: "/#how" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/40 transition-all"
                >
                  {label}
                </a>
              ))}
            </>
          ) : (
            <span
              className="text-[11px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full"
              style={{
                background: "rgba(232, 174, 183, 0.2)",
                border: "1px solid rgba(232, 174, 183, 0.4)",
                color: "hsl(var(--primary))",
              }}
            >
              {role}
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-all"
              style={{
                background: "rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/40 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.15) inset",
                }}
              >
                Join
              </button>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};
