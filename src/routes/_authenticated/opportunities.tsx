import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, GraduationCap, Award, BookOpen, Sparkles, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, FeatureTabs, SetupNotice, type FeatureTab } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/opportunities")({
  head: () => meta("Opportunities", "Jobs, scholarships, grants, courses, mentorship and inclusive businesses."),
  component: Page,
});

const tabs: FeatureTab[] = [
  { value: "jobs", label: "Jobs", icon: Briefcase, emptyTitle: "No jobs listed", emptyText: "Verified inclusive employers will post roles here.", action: <Button onClick={() => toast.info("This will be available once the community database is connected.")}>Post an opportunity</Button> },
  { value: "scholarships", label: "Scholarships", icon: GraduationCap, emptyTitle: "No scholarships", emptyText: "Scholarships will appear here with closing dates." },
  { value: "grants", label: "Grants", icon: Award, emptyTitle: "No grants", emptyText: "Grant listings will be shown here." },
  { value: "courses", label: "Courses", icon: BookOpen, emptyTitle: "No courses", emptyText: "Learning opportunities will appear here." },
  { value: "mentorship", label: "Mentorship", icon: Sparkles, emptyTitle: "No mentors yet", emptyText: "Offer or find mentorship in your field." },
  { value: "business", label: "Businesses", icon: Store, emptyTitle: "No businesses", emptyText: "LGBTQ+-owned and friendly businesses directory." },
];

function Page() {
  return (
    <div>
      <PageHeader title={"Opportunities"} description={"Jobs, scholarships, grants, courses, mentorship and inclusive businesses."} />
      
      <FeatureTabs tabs={tabs} />
    </div>
  );
}
