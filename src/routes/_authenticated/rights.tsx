import { createFileRoute } from "@tanstack/react-router";
import { Scale, Megaphone, LifeBuoy, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/rights")({
  head: () => meta("Rights & Support", "General information and verified support. This is not legal advice."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "resources", label: "Know your rights", icon: Scale, emptyTitle: "No resources for your country yet", emptyText: "Reviewed guides will be listed by country with a last-reviewed date." },
  { value: "campaigns", label: "Campaigns", icon: Megaphone, emptyTitle: "No active campaigns", emptyText: "Advocacy campaigns you can support will appear here." },
  { value: "support", label: "Support organisations", icon: LifeBuoy, emptyTitle: "No referrals yet", emptyText: "Verified legal, health and crisis organisations." },
  { value: "help", label: "Confidential help", icon: Lock, emptyTitle: "Need private help?", emptyText: "Send a confidential request. Only an assigned, trained reviewer can see it.", action: <Button onClick={() => toast.info("This will be available once the community database is connected.")}>Request help</Button> },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Rights & Support"} description={"General information and verified support. This is not legal advice."} />
      <SetupNotice>If you are in immediate danger, contact local emergency services first.</SetupNotice>
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
