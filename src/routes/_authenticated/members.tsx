import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => meta("Members", "Find members who chose to be discoverable. Hidden profiles never appear here."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "search", label: "Search", icon: Search, emptyTitle: "No members to show", emptyText: "Only people who turned on \u201cdiscoverable\u201d appear in search." },
  { value: "requests", label: "Connection requests", icon: UserPlus, emptyTitle: "No requests", emptyText: "Requests need your approval before anyone can message you." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Members"} description={"Find members who chose to be discoverable. Hidden profiles never appear here."} />
      
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
