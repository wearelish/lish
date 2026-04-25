import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "./shared";
import { LogOut } from "lucide-react";

export const CDSettings = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user, signOut } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name ?? "",
    organization: user?.user_metadata?.organization ?? "",
    email: user?.email ?? "",
  });
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: form.full_name.trim(), organization: form.organization.trim() },
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated!");
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (pw.next !== pw.confirm) { toast.error("Passwords don't match"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setSavingPw(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed!");
    setPw({ next: "", confirm: "" });
  };

  const initials = (form.full_name || user?.email || "?")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile and account preferences." />

      <div className="max-w-xl space-y-6">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white text-xl font-semibold">
            {initials}
          </div>
          <div>
            <p className="font-medium">{form.full_name || "Your Name"}</p>
            <p className="text-sm text-muted-foreground">{form.email}</p>
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-2xl p-6">
          <h2 className="font-serif text-lg mb-4">Profile</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Organization</Label>
              <Input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })}
                placeholder="Your company or org" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email} disabled className="rounded-xl h-11 opacity-60" />
              <p className="text-[11px] text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <Button type="submit" disabled={saving} className="rounded-full bg-foreground text-background border-0 h-10 px-6">
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-2xl p-6">
          <h2 className="font-serif text-lg mb-4">Change Password</h2>
          <form onSubmit={savePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })}
                placeholder="Min. 8 characters" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm new password</Label>
              <Input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })}
                placeholder="Repeat password" className="rounded-xl h-11" />
            </div>
            <Button type="submit" disabled={savingPw} className="rounded-full bg-foreground text-background border-0 h-10 px-6">
              {savingPw ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </motion.div>

        {/* Sign out */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button onClick={signOut} variant="outline" className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 gap-2">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
