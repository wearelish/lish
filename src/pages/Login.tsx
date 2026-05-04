import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"email" | "employee">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [empPw, setEmpPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginEmail = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    toast.success("Welcome back!"); navigate("/");
  };

  const loginEmployee = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const { data, error: err } = await supabase.rpc("get_email_by_employee_code", { _code: empCode });
    if (err || !data) { setLoading(false); setError("Invalid employee ID. Check with your admin."); return; }
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: data as string, password: empPw });
    setLoading(false);
    if (signErr) { setError(signErr.message); return; }
    toast.success("Welcome!"); navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 hero-bg p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-accent opacity-50 blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-secondary opacity-60 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl font-bold text-gradient">LISH</h1>
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-5xl font-semibold text-gradient leading-tight">Welcome back</h2>
          <p className="mt-4 text-muted-foreground text-base max-w-xs">Sign in to your workspace and continue where you left off.</p>
          <div className="mt-8 space-y-3">
            {["Premium digital services", "Transparent workflow", "Secure payments"].map((t) => (
              <div key={t} className="glass rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />{t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground relative z-10">© {new Date().getFullYear()} LISH</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white/60 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <h1 className="font-serif text-3xl font-bold text-gradient">LISH</h1>
          </div>
          <h1 className="font-serif text-3xl text-gradient">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-8">Enter your workspace</p>

          {/* Tab */}
          <div className="flex gap-1 p-1 bg-secondary rounded-full mb-6 w-fit">
            {(["email", "employee"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "email" ? "Client / Admin" : "Employee"}
              </button>
            ))}
          </div>

          {tab === "email" ? (
            <form onSubmit={loginEmail} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-11 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background border-0 h-11">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={loginEmployee} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input required value={empCode} onChange={e => setEmpCode(e.target.value)} placeholder="e.g. LISH-001" className="rounded-xl h-11 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} required value={empPw} onChange={e => setEmpPw(e.target.value)} placeholder="••••••••" className="rounded-xl h-11 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background border-0 h-11">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
