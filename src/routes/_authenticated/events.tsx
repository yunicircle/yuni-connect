import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Ticket, HandHelping } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => meta("Events", "Meetups, workshops and virtual gatherings."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "upcoming", label: "Upcoming", icon: CalendarDays, emptyTitle: "No upcoming events", emptyText: "Events near you or online will be listed here.", action: <Button onClick={() => toast.info("This will be available once the community database is connected.")}>Host an event</Button> },
  { value: "mine", label: "My RSVPs", icon: Ticket, emptyTitle: "No RSVPs yet", emptyText: "Events you're going to or waitlisted for appear here. You can hide your attendance." },
  { value: "volunteer", label: "Volunteer", icon: HandHelping, emptyTitle: "No volunteer roles", emptyText: "Organisers can ask for help with events." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Events"} description={"Meetups, workshops and virtual gatherings."} />
      
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
