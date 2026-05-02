import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SectionHeader } from "./shared";
import { useAuth } from "@/hooks/useAuth";

export const ADSettings = ({ onNavigate: _ }: { onNavigate: (s: any) => void }) => {
  const { user, signOut } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    upi_id: user?.user_metadata?.upi_id ?? "",
  });
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: form.full_name, upi_id: form.upi_id } });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) { toast.error("Min 8 characters"); return; }
    if (pw.next !== pw.confirm) { toast.error("Passwords don't match"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setSavingPw(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    setPw({ next: "", confirm: "" });
  };

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Platform configuration and admin preferences." />

      <div className="max-w-xl space-y-5">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-4">Admin Profile</h2>
          <form onSubmit={saveProfile} className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Full Name</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="rounded-xl h-10" /></div>
            <div className="space-y-1"><Label className="text-xs">Email</Label>
              <Input value={form.email} disabled className="rounded-xl h-10 opacity-60" /></div>
            <Button type="submit" disabled={saving} className="rounded-xl bg-rose-500 text-white border-0 h-9 px-5 text-sm">
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </form>
        </motion.div>

        {/* Payment config */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-1">Payment Configuration</h2>
          <p className="text-xs text-stone-400 mb-4">Platform payment rules and UPI details.</p>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">UPI ID</Label>
              <Input value={form.upi_id} onChange={e => setForm({ ...form, upi_id: e.target.value })} placeholder="yourname@upi" className="rounded-xl h-10" /></div>
            <div className="bg-stone-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-stone-600">Payment Rules</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Upfront payment</span>
                <span className="font-bold text-stone-800">40%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Final payment (on delivery)</span>
                <span className="font-bold text-stone-800">60%</span>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="rounded-xl bg-rose-500 text-white border-0 h-9 px-5 text-sm">
              Save Payment Config
            </Button>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-4">Change Password</h2>
          <form onSubmit={savePassword} className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">New Password</Label>
              <Input type="password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} placeholder="Min. 8 characters" className="rounded-xl h-10" /></div>
            <div className="space-y-1"><Label className="text-xs">Confirm Password</Label>
              <Input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} placeholder="Repeat" className="rounded-xl h-10" /></div>
            <Button type="submit" disabled={savingPw} className="rounded-xl bg-stone-800 text-white border-0 h-9 px-5 text-sm">
              {savingPw ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </motion.div>

        <Button 
          onClick={async () => {
            try {
              console.log('[ADSettings] Sign out clicked');
              await signOut();
            } catch (error) {
              console.error('[ADSettings] Sign out error:', error);
            }
          }} 
          variant="outline" 
          className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 h-9 px-5 text-sm"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};
