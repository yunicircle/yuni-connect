import { createFileRoute } from "@tanstack/react-router";
import { HandCoins, HeartHandshake, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/funding")({
  head: () => meta("Community funding", "Verified campaigns, mutual aid and grant programmes."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "campaigns", label: "Campaigns", icon: HandCoins, emptyTitle: "No campaigns yet", emptyText: "Approved campaigns will appear here once reviewed.", action: <Button onClick={() => toast.info("This will be available once the community database is connected.")}>Start a campaign</Button> },
  { value: "mutual", label: "Mutual aid", icon: HeartHandshake, emptyTitle: "No mutual aid requests", emptyText: "Members can request and offer direct support." },
  { value: "grants", label: "Grant programmes", icon: FileText, emptyTitle: "No open grant programmes", emptyText: "Applications are private and only seen by assigned reviewers." },
  { value: "reports", label: "Transparency", icon: BarChart3, emptyTitle: "No summaries yet", emptyText: "Public summaries of funds raised and distributed." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Community funding"} description={"Verified campaigns, mutual aid and grant programmes."} />
      <SetupNotice>Donations are in test mode. No payment provider is connected yet, so no money can be sent or received.</SetupNotice>
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
