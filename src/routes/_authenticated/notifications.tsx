import { createFileRoute } from "@tanstack/react-router";
import { Bell, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => meta("Notifications", "Updates from your groups, messages and events."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "all", label: "All", icon: Bell, emptyTitle: "You're all caught up", emptyText: "New notifications will show up here." },
  { value: "prefs", label: "Preferences", icon: Settings, emptyTitle: "Notification settings", emptyText: "Choose what you hear about. Settings will save once your account is fully set up." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Notifications"} description={"Updates from your groups, messages and events."} />
      
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
