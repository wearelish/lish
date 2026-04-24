import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/lish/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate("/dashboard/client");
  };

  const onEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.rpc("get_email_by_employee_code", { _code: empCode });
    if (error || !data) {
      setLoading(false);
      return toast.error("Invalid employee code");
    }
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: data as string, password: empPassword });
    setLoading(false);
    if (signErr) return toast.error(signErr.message);
    toast.success("Welcome to LISH");
    navigate("/dashboard/employee");
  };

  return (
    <div className="min-h-screen hero-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-8 w-full max-w-md"
        >
          <h1 className="font-serif text-3xl text-gradient text-center">Welcome back</h1>
          <p className="text-center text-muted-foreground text-sm mt-2">Sign in to continue</p>

          <Tabs defaultValue="email" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full bg-secondary rounded-full">
              <TabsTrigger value="email" className="rounded-full">Client / Admin</TabsTrigger>
              <TabsTrigger value="employee" className="rounded-full">Employee</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={onEmailLogin} className="space-y-4 mt-5">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0 h-11">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="employee">
              <form onSubmit={onEmployeeLogin} className="space-y-4 mt-5">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input required value={empCode} onChange={(e) => setEmpCode(e.target.value)} placeholder="e.g. LISH-001" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0 h-11">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here? <Link to="/signup" className="text-primary font-medium">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;