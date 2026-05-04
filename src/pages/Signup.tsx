import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, User, Briefcase } from "lucide-react";

type Role = "client" | "employee";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("client");
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.name.trim().length < 2) { setError("Name must be at least 2 characters"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (role === "employee" && !form.code.trim()) { setError("Employee access code is required"); return; }
    setLoading(true);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name } },
    });

    if (signUpErr) {
      setLoading(false);
      setError(signUpErr.message.toLowerCase().includes("already") ? "Account already exists. Sign in instead." : signUpErr.message);
      return;
    }

    const uid = data.user?.id;
    if (!uid) { setLoading(false); setError("Signup failed. Please try again."); return; }

    if (role === "employee") {
      const { data: ok, error: roleErr } = await supabase.rpc("set_signup_role", {
        _user_id: uid, _role: "employee", _code: form.code,
      });
      if (roleErr || !ok) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("Invalid employee access code. Ask your admin for the correct code.");
        return;
      }
    }

    setLoading(false);
    toast.success("Account created! Welcome to LISH.");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 hero-bg p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-accent opacity-50 blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-secondary opacity-60 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl font-bold text-gradient">LISH</h1>
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-5xl font-semibold text-gradient leading-tight">Join LISH</h2>
          <p className="mt-4 text-muted-foreground text-base max-w-xs">Choose your role and get access to your workspace.</p>
        </div>
        <p className="text-xs text-muted-foreground relative z-10">© {new Date().getFullYear()} LISH</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white/60 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <h1 className="font-serif text-3xl font-bold text-gradient">LISH</h1>
          </div>
          <h1 className="font-serif text-3xl text-gradient">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-6">Choose your role to get started</p>

          {/* Role selector — Client and Employee only. Admin is created manually. */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { id: "client" as Role, label: "Client", desc: "Request services", Icon: User },
              { id: "employee" as Role, label: "Employee", desc: "Work on projects", Icon: Briefcase },
            ]).map(r => (
              <button key={r.id} type="button" onClick={() => { setRole(r.id); setError(""); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === r.id ? "border-primary bg-primary/5" : "border-border bg-white/40 hover:bg-white/70"}`}>
                <r.Icon className={`w-5 h-5 ${role === r.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-semibold ${role === r.id ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" className="rounded-xl h-11 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {role === "employee" && (
              <div className="space-y-1.5">
                <Label>Employee Access Code</Label>
                <Input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Ask your admin for this code" className="rounded-xl h-11 font-mono" />
                <p className="text-xs text-muted-foreground">Default code: LISH-EMP-2024</p>
              </div>
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background border-0 h-11">
              {loading ? "Creating account…" : `Join as ${role === "client" ? "Client" : "Employee"}`}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
