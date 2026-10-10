import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => meta("Messages", "Private conversations. New people must send a request first."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "chats", label: "Chats", icon: MessageCircle, emptyTitle: "No conversations", emptyText: "Start a conversation from a member's profile." },
  { value: "requests", label: "Requests", icon: Inbox, emptyTitle: "No message requests", emptyText: "You'll decide whether to accept each new request." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Messages"} description={"Private conversations. New people must send a request first."} />
      
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
