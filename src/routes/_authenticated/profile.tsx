import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Briefcase, Scale, HandCoins, Users, CalendarDays, ShieldCheck } from "lucide-react";
import { PageHeader, EmptyState, SetupNotice } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => meta("Your profile", "Control what others see, export your data or delete your account."),
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
      <PageHeader title="Your profile" description="Control what others see, export your data or delete your account." />
      <EmptyState icon={ShieldCheck} title="Profile and privacy settings" text="Pseudonym, per-field visibility, discoverability, data export and account deletion become available once the profiles database is connected." />
    </div>
  );
}
