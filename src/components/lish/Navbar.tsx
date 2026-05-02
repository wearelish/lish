import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { LishLogo } from "@/components/lish/LishLogo";
import { LogOut, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how" },
  { label: "About", href: "/#about" },
];

export const Navbar = () => {
  const { user, role, signOut, signingOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('[Navbar] Sign out button clicked');
      await signOut();
      console.log('[Navbar] Sign out completed, navigating to home');
      navigate("/");
      setMobileOpen(false);
    } catch (error) {
      console.error('[Navbar] Sign out error:', error);
      // Still navigate even if there's an error
      navigate("/");
      setMobileOpen(false);
    }
  };

  const glassStyle: React.CSSProperties = {
    borderRadius: "9999px",
    background: "rgba(255, 255, 255, 0.22)",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow:
      "0 8px 32px -8px rgba(180, 120, 120, 0.15), 0 1px 0 rgba(255,255,255,0.8) inset",
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3"
      >
        <nav
          className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between"
          style={glassStyle}
        >
          {/* Logo — bigger */}
          <Link to="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
            <LishLogo className="h-11 w-auto" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground/65 hover:text-foreground hover:bg-white/50 transition-all"
                >
                  {label}
                </a>
              ))
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

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.6)" }}
              >
                {signingOut ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/50 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-1.5 rounded-full text-sm font-semibold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.12) inset",
                  }}
                >
                  Join
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/40 transition-all text-foreground/70"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto mt-2 px-4 py-4 flex flex-col gap-1"
              style={{
                borderRadius: "1.5rem",
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 8px 32px -8px rgba(180,120,120,0.18)",
              }}
            >
              {!user ? (
                <>
                  {NAV_LINKS.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-white/60 hover:text-foreground transition-all"
                    >
                      {label}
                    </a>
                  ))}
                  <div className="border-t border-stone-100 my-1" />
                  <button
                    onClick={() => { navigate("/login"); setMobileOpen(false); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-white/60 text-left transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { navigate("/signup"); setMobileOpen(false); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white text-left transition-all"
                    style={{ background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)" }}
                  >
                    Join LISH
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Signed in as {role}
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 text-left flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signingOut ? (
                      <>
                        <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" /> Sign out
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};
