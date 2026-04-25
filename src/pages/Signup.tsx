import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LishLogo } from "@/components/lish/LishLogo";
import { Eye, EyeOff, User, Briefcase, ShieldCheck } from "lucide-react";

type Role = "client" | "employee" | "admin";

const roles = [
  { id: "client" as Role, label: "Client", desc: "Request services & track projects", icon: User, needsCode: false },
  { id: "employee" as Role, label: "Employee", desc: "Work on assigned projects", icon: Briefcase, needsCode: true },
  { id: "admin" as Role, label: "Admin", desc: "Manage the entire workspace", icon: ShieldCheck, needsCode: true },
];

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("client");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", code: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = roles.find(r => r.id === role)!;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.fullName.trim().length < 2) { setError("Full name must be at least 2 characters"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: form.fullName },
      },
    });

    if (signUpErr) {
      setLoading(false);
      setError(signUpErr.message.toLowerCase().includes("already") ? "Account already exists. Sign in instead." : signUpErr.message);
      return;
    }

    const uid = data.user?.id;
    if (!uid) { setLoading(false); setError("Signup failed, please try again."); return; }

    if (role !== "client") {
      const { data: ok, error: roleErr } = await supabase.rpc("set_signup_role", {
        _user_id: uid,
        _role: role,
        _code: form.code,
      });
      if (roleErr || !ok) {
        await supabase.auth.signOut();
        setLoading(false);
        setError(`Invalid ${role} access code. Please check and try again.`);
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome to LISH!");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex flex-col justify-between w-1/2 hero-bg p-12 relative overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[hsl(var(--accent))] opacity-50 blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[hsl(var(--secondary))] opacity-60 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <LishLogo className="h-14 w-auto relative z-10" />
        <div className="relative z-10">
          <h2 className="font-serif text-5xl font-semibold text-gradient leading-tight">Join<br />LISH</h2>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-xs">
            Choose your role and enter your workspace. Clients, employees, and admins each get a tailored experience.
          </p>
          <div className="mt-10 space-y-3">
            {roles.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }}
                className={`glass rounded-2xl px-4 py-3 text-sm font-medium inline-flex items-center gap-2 ${role === r.id ? "text-foreground" : "text-foreground/60"}`}>
                <r.icon className="w-4 h-4 text-primary" />{r.label}
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground relative z-10">© {new Date().getFullYear()} LISH</p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white/60 backdrop-blur-sm overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="w-full max-w-md">
          <div className="lg:hidden mb-8"><LishLogo className="h-12 w-auto" /></div>
          <h1 className="font-serif text-3xl text-gradient">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-6">Choose your role to get started</p>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {roles.map((r) => (
              <button key={r.id} type="button"
                onClick={() => { setRole(r.id); setError(""); setForm(f => ({ ...f, code: "" })); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${role === r.id ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-white/40 hover:bg-white/70"}`}>
                <r.icon className={`w-5 h-5 ${role === r.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs font-medium ${role === r.id ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.p key={role} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-muted-foreground mb-5 px-1">
              {selectedRole.desc}
            </motion.p>
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="rounded-xl h-11 focus-visible:ring-primary" placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="rounded-xl h-11 focus-visible:ring-primary" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="rounded-xl h-11 pr-10 focus-visible:ring-primary" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {selectedRole.needsCode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="space-y-1.5 pt-1">
                    <Label>{role === "admin" ? "Admin" : "Employee"} Access Code</Label>
                    <Input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="rounded-xl h-11 focus-visible:ring-primary font-mono tracking-wider" placeholder={role === "admin" ? "Admin secret code" : "e.g. LISH-EMP-2024"} />
                    <p className="text-[11px] text-muted-foreground">Ask your LISH admin for the access code.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm">{error}</motion.p>}

            <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 h-11 mt-2">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />Creating account...</span>
                : `Join as ${selectedRole.label}`}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
