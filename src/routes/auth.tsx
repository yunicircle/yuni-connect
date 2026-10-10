import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { meta } from "@/lib/meta";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode | undefined } => ({
    mode: s["mode"] === "signup" || s["mode"] === "forgot" ? (s["mode"] as Mode) : undefined,
  }),
  head: () => meta("Sign in", "Sign in or join Yuni Circle."),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/onboarding` } });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("If that email exists, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/home" });
    if (res?.error) toast.error("Google sign-in failed");
  }

  const title = mode === "signin" ? "Welcome back" : mode === "signup" ? "Join Yuni Circle" : "Reset your password";

  return (
    <div className="min-h-screen">
      <div className="rainbow-line" />
      <div className="mx-auto flex max-w-md flex-col px-4 py-10">
        <Brand />
        <div className="mt-10 rounded-3xl border bg-card p-6 shadow-soft">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>
          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
            </>
          )}
          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            {mode === "signin" && <button className="text-primary underline-offset-4 hover:underline" onClick={() => setMode("forgot")}>Forgot password?</button>}
            {mode !== "signup" ? (
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("signup")}>New here? Create an account</button>
            ) : (
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("signin")}>Already a member? Sign in</button>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">You can use a pseudonym. Your email is never shown to other members.</p>
      </div>
    </div>
  );
}
