import { createFileRoute } from "@tanstack/react-router";
import { Flag, Gavel, CalendarCheck, BadgeCheck, Wallet, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => meta("Admin", "Tools for moderators, organisers, reviewers and finance staff. Access depends on your role."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "reports", label: "Reports", icon: Flag, emptyTitle: "No open reports", emptyText: "Member reports waiting for review appear here." },
  { value: "moderation", label: "Moderation", icon: Gavel, emptyTitle: "No actions", emptyText: "Moderation decisions are logged and reviewed." },
  { value: "events", label: "Events", icon: CalendarCheck, emptyTitle: "Nothing to approve", emptyText: "Event submissions waiting for approval." },
  { value: "opps", label: "Opportunities", icon: BadgeCheck, emptyTitle: "Nothing to verify", emptyText: "Opportunity listings waiting for verification." },
  { value: "finance", label: "Finance", icon: Wallet, emptyTitle: "Nothing pending", emptyText: "Campaign approvals and payouts." },
  { value: "audit", label: "Audit log", icon: ScrollText, emptyTitle: "No entries", emptyText: "Every sensitive action is recorded here." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Admin"} description={"Tools for moderators, organisers, reviewers and finance staff. Access depends on your role."} />
      <SetupNotice>Admins never see private messages, dating activity or confidential help requests unless a case is assigned to them.</SetupNotice>
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
