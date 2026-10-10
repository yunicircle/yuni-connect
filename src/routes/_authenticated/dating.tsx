import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Briefcase, Scale, HandCoins, Users, CalendarDays, ShieldCheck } from "lucide-react";
import { PageHeader, EmptyState, SetupNotice } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/dating")({
  head: () => meta("Dating", "An optional, adults-only space kept separate from your community profile."),
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
      <PageHeader title="Dating" description="An optional, adults-only space kept separate from your community profile." />
      <SetupNotice>Dating is off by default. You must be 18+ and opt in. Unmatching ends the chat.</SetupNotice>
      <EmptyState icon={Heart} title="Dating is not turned on" text="When you opt in, you can set preferences, browse and match. This becomes available once the dating database is connected." />
    </div>
  );
}
