import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, LogOut } from "lucide-react";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "How it works", href: "#how" },
];

export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
      <nav className="max-w-5xl mx-auto px-5 py-2.5 flex items-center justify-between rounded-full"
        style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px -8px rgba(180,120,120,0.15)" }}>
        <Link to="/" className="font-serif text-xl font-bold text-gradient">LISH</Link>

        <div className="hidden md:flex items-center gap-1">
          {!user ? NAV.map(n => (
            <a key={n.label} href={n.href} className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground/65 hover:text-foreground hover:bg-white/50 transition-all">{n.label}</a>
          )) : (
            <span className="text-[11px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">{role}</span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <button onClick={signOut} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-all bg-white/35 border border-white/60">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/50 transition-all">Login</button>
              <button onClick={() => navigate("/signup")} className="px-5 py-1.5 rounded-full text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)" }}>Join</button>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded-full hover:bg-white/40 transition-all" onClick={() => setOpen(o => !o)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="max-w-5xl mx-auto mt-2 px-4 py-4 flex flex-col gap-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.7)" }}>
          {!user ? (
            <>
              {NAV.map(n => <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-white/60">{n.label}</a>)}
              <div className="border-t border-stone-100 my-1" />
              <button onClick={() => { navigate("/login"); setOpen(false); }} className="px-4 py-2.5 rounded-xl text-sm font-medium text-left">Login</button>
              <button onClick={() => { navigate("/signup"); setOpen(false); }} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white text-left" style={{ background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)" }}>Join LISH</button>
            </>
          ) : (
            <button onClick={signOut} className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 text-left flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
};
