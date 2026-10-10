import { createFileRoute } from "@tanstack/react-router";
import { Users, MessageSquare, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => meta("Community", "Groups, posts and conversations with people who share your interests."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "groups", label: "Groups", icon: Users, emptyTitle: "No groups yet", emptyText: "Groups you join will appear here. Start one for your city, interest or identity.", action: <Button onClick={() => toast.info("This will be available once the community database is connected.")}>Create a group</Button> },
  { value: "feed", label: "Feed", icon: MessageSquare, emptyTitle: "Your feed is quiet", emptyText: "Posts from your groups will show up here once you join some.", action: <Button onClick={() => toast.info("This will be available once the community database is connected.")}>Write a post</Button> },
  { value: "saved", label: "Saved", icon: Bookmark, emptyTitle: "Nothing saved", emptyText: "Save posts to read later." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Community"} description={"Groups, posts and conversations with people who share your interests."} />
      
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
