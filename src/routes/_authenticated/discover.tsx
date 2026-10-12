import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, Star, Heart, Briefcase, Scale, HandCoins, Users, CalendarDays } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/feature";
import { ProfileCard } from "@/components/profile-card";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles } from "@/lib/social";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => meta("Discover", "Major announcements and top profiles to follow."),
  component: Page,
});

const cards = [
  { to: "/community", label: "Community", icon: Users },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/dating", label: "Dating", icon: Heart },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/rights", label: "Rights & Support", icon: Scale },
  { to: "/funding", label: "Funding", icon: HandCoins },
] as const;

function Page() {
  const announcements = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
  });
  const top = useProfiles({ top: true });

  return (
    <div className="space-y-10">
      <PageHeader title="Discover" description="What's new at Yuni Circle and people worth following." />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold"><Megaphone className="h-5 w-5 text-primary" aria-hidden />Announcements</h2>
        {announcements.data?.length ? (
          <div className="space-y-3">
            {announcements.data.map((a) => (
              <article key={a.id} className="rounded-2xl border bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 font-semibold text-primary">Yuni Circle</span>
                  <time dateTime={a.created_at}>{new Date(a.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</time>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{a.title}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
              </article>
            ))}
          </div>
        ) : <EmptyState icon={Megaphone} title="No announcements yet" text="Major news from the Yuni Circle team will be posted here." />}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold"><Star className="h-5 w-5 text-primary" aria-hidden />Top profiles to follow</h2>
        {top.data?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">{top.data.map((p) => <ProfileCard key={p.id} p={p} />)}</div>
        ) : <EmptyState icon={Users} title="No profiles yet" text="As members join, the most-followed profiles will appear here." />}
        <Link to="/members" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Search for friends →</Link>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Explore</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="rounded-2xl border bg-card p-5 shadow-soft transition hover:border-primary">
              <c.icon className="h-6 w-6 text-primary" aria-hidden />
              <p className="mt-3 font-semibold">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
