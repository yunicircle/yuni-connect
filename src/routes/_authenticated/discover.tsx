import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Briefcase, Scale, HandCoins, Users, CalendarDays, ShieldCheck } from "lucide-react";
import { PageHeader, EmptyState, SetupNotice } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => meta("Discover", "Dating, opportunities, rights and community funding."),
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
void cards; void EmptyState; void SetupNotice; void ShieldCheck; void Link;

function Page() {
  return (
    <div>
      <PageHeader title="Discover" description="Dating, opportunities, rights and community funding." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl border bg-card p-5 shadow-soft transition hover:border-primary">
            <c.icon className="h-6 w-6 text-primary" aria-hidden />
            <p className="mt-3 font-semibold">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
