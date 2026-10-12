import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, FileText, Users, CalendarDays, Search, Eye, Lock, Globe, UserCheck, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/feature";
import { ProfileIdentity } from "@/components/profile-identity";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useMe } from "@/lib/social";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => meta("Your profile & privacy", "See and control who sees your profile, posts, groups and events."),
  component: Page,
});

type Level = "only_me" | "connections" | "members";
const levels: { value: Level; label: string; icon: typeof Lock; who: string }[] = [
  { value: "only_me", label: "Only me", icon: Lock, who: "Nobody else can see this." },
  { value: "connections", label: "Connections", icon: UserCheck, who: "Only people you have accepted can see this." },
  { value: "members", label: "All members", icon: Globe, who: "Any signed-in Yuni member can see this. Never visible outside Yuni." },
];

const areas = [
  { key: "profile", label: "Profile details", icon: User, hint: "Bio, pronouns, city and interests" },
  { key: "posts", label: "Posts", icon: FileText, hint: "Who sees posts outside private groups" },
  { key: "groups", label: "Group membership", icon: Users, hint: "Which groups appear on your profile" },
  { key: "events", label: "Event participation", icon: CalendarDays, hint: "Whether your RSVPs are shown to other attendees" },
] as const;

function Page() {
  const [vis, setVis] = useState<Record<string, Level>>({ profile: "connections", posts: "connections", groups: "only_me", events: "only_me" });
  const [discoverable, setDiscoverable] = useState(true);
  const { data: me } = useMe();
  useEffect(() => { if (me) supabase.from("profiles").select("discoverable").eq("id", me).single().then(({ data }) => data && setDiscoverable(data.discoverable)); }, [me]);
  async function setDisc(v: boolean) {
    setDiscoverable(v);
    if (me) { const { error } = await supabase.from("profiles").update({ discoverable: v }).eq("id", me); if (error) toast.error(error.message); else toast.success(v ? "You now appear in search" : "Hidden from search"); }
  }
  const soon = () => toast.info("This will be saved once your account data is connected.");

  return (
    <div className="space-y-8">
      <PageHeader title="Your profile & privacy" description="You decide who sees what." />
      <ProfileIdentity />

      <section className="rounded-3xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" aria-hidden /><h2 className="text-xl font-semibold">Who can see me right now</h2></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {areas.map((a) => {
            const l = levels.find((x) => x.value === vis[a.key])!;
            return (
              <div key={a.key} className="flex items-start gap-3 rounded-2xl bg-muted p-4">
                <a.icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
                <div><p className="font-semibold">{a.label}: <span className="text-primary">{l.label}</span></p><p className="text-sm text-muted-foreground">{l.who}</p></div>
              </div>
            );
          })}
          <div className="flex items-start gap-3 rounded-2xl bg-muted p-4 sm:col-span-2">
            <Search className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <p className="text-sm"><span className="font-semibold">Member search: </span>{discoverable ? "Members can find you by display name." : "You are hidden from member search."}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Visibility settings</h2>
        {areas.map((a) => (
          <fieldset key={a.key} className="rounded-2xl border bg-card p-4">
            <legend className="sr-only">{a.label}</legend>
            <p className="font-semibold">{a.label}</p>
            <p className="mb-3 text-sm text-muted-foreground">{a.hint}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {levels.map((l) => (
                <button key={l.value} type="button" aria-pressed={vis[a.key] === l.value} onClick={() => setVis({ ...vis, [a.key]: l.value })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${vis[a.key] === l.value ? "border-primary bg-primary-soft text-primary" : "hover:border-primary"}`}>
                  <l.icon className="h-4 w-4" aria-hidden />{l.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
          <div><p className="font-semibold">Show me in member search</p><p className="text-sm text-muted-foreground">Lets people find you by username in Find friends and Discover.</p></div>
          <Switch checked={discoverable} onCheckedChange={setDisc} aria-label="Show me in member search" />
        </div>
        <Button onClick={soon}>Save privacy settings</Button>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={soon}><Download className="h-4 w-4" />Export my data</Button>
        <Button variant="destructive" onClick={soon}><Trash2 className="h-4 w-4" />Delete my account</Button>
      </section>
    </div>
  );
}
