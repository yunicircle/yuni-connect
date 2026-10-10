import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/reset-password")({
  head: () => meta("Set a new password", "Choose a new password for your Yuni Circle account."),
  component: Reset,
});

function Reset() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/home" });
  }
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Brand />
      <form onSubmit={submit} className="mt-10 space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">Set a new password</h1>
        <div className="space-y-1.5">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">Save password</Button>
      </form>
    </div>
  );
}
