import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LishLogo } from "@/components/lish/LishLogo";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"email" | "employee">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    toast.success("Welcome back!");
    navigate("/");
  };

  const onEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase.rpc("get_email_by_employee_code", { _code: empCode });
    if (err || !data) { setLoading(false); setError("Invalid employee ID"); return; }
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: data as string, password: empPassword });
    setLoading(false);
    if (signErr) { setError(signErr.message); return; }
    toast.success("Welcome to LISH");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex flex-col justify-between w-1/2 hero-bg p-12 relative overflow-hidden"
      >
        {/* blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[hsl(var(--accent))] opacity-50 blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[hsl(var(--secondary))] opacity-60 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

        <LishLogo className="h-14 w-auto relative z-10" />

        <div className="relative z-10">
          <h2 className="font-serif text-5xl font-semibold text-gradient leading-tight">
            Welcome to<br />LISH
          </h2>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-xs">
            A digital workplace for building powerful products. Sign in to enter your workspace.
          </p>

          {/* floating cards */}
          <div className="mt-10 space-y-3">
            {["100% Remote Team", "Real Projects. Real Pay.", "Transparent Workflow"].map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="glass rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 inline-flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t}
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground relative z-10">© {new Date().getFullYear()} LISH</p>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <LishLogo className="h-12 w-auto" />
          </div>

          <h1 className="font-serif text-3xl text-gradient">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-8">Enter your workspace</p>

          {/* Tab toggle */}
          <div className="flex gap-1 p-1 bg-secondary rounded-full mb-6 w-fit">
            {(["email", "employee"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "email" ? "Client / Admin" : "Employee"}
              </button>
            ))}
          </div>

          {tab === "email" ? (
            <form onSubmit={onEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="rounded-xl h-11 focus-visible:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="rounded-xl h-11 pr-10 focus-visible:ring-primary"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 h-11 mt-2">
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />Signing in...</span> : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onEmployeeLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input
                  required value={empCode}
                  onChange={e => setEmpCode(e.target.value)}
                  className="rounded-xl h-11 focus-visible:ring-primary"
                  placeholder="e.g. LISH-001"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"} required value={empPassword}
                    onChange={e => setEmpPassword(e.target.value)}
                    className="rounded-xl h-11 pr-10 focus-visible:ring-primary"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 h-11 mt-2">
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />Signing in...</span> : "Sign in"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
