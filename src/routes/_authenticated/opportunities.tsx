import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Briefcase, GraduationCap, Users, Store, BookOpen, ShieldCheck, Search, BadgeCheck, ListChecks, Rocket, Flag, Bookmark, Bell, MapPin, CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState } from "@/components/feature";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/opportunities")({
  head: () => meta("Yuni Opportunities", "Careers, scholarships, mentorship, enterprise support and learning for the Yuni community."),
  component: Page,
});

const programs = [
  { id: "careers", name: "Yuni Careers", icon: Briefcase, tagline: "A curated directory of employment and professional opportunities.",
    items: ["Job vacancies and internships", "Remote and freelance work", "CV and portfolio support", "Interview preparation and career workshops", "Connections with vetted employers and professional networks"] },
  { id: "scholars", name: "Yuni Scholars", icon: GraduationCap, tagline: "Education pathways and funded learning.",
    items: ["University and postgraduate scholarships", "Vocational training and certification programs", "Leadership fellowships", "Conference and exchange opportunities", "Application guides and deadline reminders"] },
  { id: "mentors", name: "Yuni Mentors", icon: Users, tagline: "Structured mentorship with experienced professionals and trained mentors.",
    items: ["Career guidance", "Entrepreneurship and business development", "Leadership and advocacy", "Academic and professional development", "Personal goal setting and accountability"] },
  { id: "enterprise", name: "Yuni Enterprise", icon: Store, tagline: "Support for members starting or growing a business.",
    items: ["Entrepreneurship training", "Business planning resources", "Financial literacy workshops", "Networking and professional referrals", "Verified incubators, business competitions and grant programmes"] },
  { id: "learn", name: "Yuni Learn", icon: BookOpen, tagline: "Practical learning to grow your skills.",
    items: ["Digital skills and technology", "Communication and leadership", "Creative skills and portfolio development", "Workplace readiness", "Financial literacy and project management"] },
] as const;

const steps = [
  { icon: ShieldCheck, title: "Join safely", text: "Create an account, choose a display name and control your visibility. You never need to share your sexual orientation to use career resources." },
  { icon: Search, title: "Discover opportunities", text: "Browse jobs, scholarships, mentorship, training and entrepreneurship. Filter by location, eligibility and deadline." },
  { icon: BadgeCheck, title: "Check credibility", text: "Every listing shows its source, verification status and eligibility. Report anything suspicious in one tap." },
  { icon: ListChecks, title: "Take action", text: "Save listings, follow an application checklist, get optional reminders and track your own progress privately." },
  { icon: Rocket, title: "Build momentum", text: "Attend a workshop, join a mentorship programme or find your next opportunity." },
];

const notReady = () => toast.info("Listings open once Yuni staff publish verified opportunities.");

function Page() {
  const [active, setActive] = useState<(typeof programs)[number]["id"]>("careers");
  const program = programs.find((p) => p.id === active)!;
  return (
    <div className="space-y-10">
      <PageHeader title="Yuni Opportunities" description="Careers, scholarships, mentorship, enterprise and learning — verified by Yuni staff, private by default." />

      <section aria-labelledby="how">
        <h2 id="how" className="mb-4 text-xl font-semibold">How it works</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-2 text-primary">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold">{i + 1}</span>
                <s.icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="programs">
        <h2 id="programs" className="mb-4 text-xl font-semibold">Programmes</h2>
        <div role="tablist" className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {programs.map((p) => (
            <button key={p.id} role="tab" aria-selected={active === p.id} onClick={() => setActive(p.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${active === p.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>
              <p.icon className="h-4 w-4" aria-hidden />{p.name}
            </button>
          ))}
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><program.icon className="h-6 w-6" aria-hidden /></span>
            <div>
              <h3 className="text-2xl font-semibold">{program.name}</h3>
              <p className="text-muted-foreground">{program.tagline}</p>
            </div>
          </div>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {program.items.map((it) => (
              <li key={it} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm"><BadgeCheck className="h-4 w-4 text-primary" aria-hidden />{it}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="browse" className="space-y-4">
        <h2 id="browse" className="text-xl font-semibold">Browse {program.name}</h2>
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="relative sm:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder="Search listings" aria-label="Search listings" /></div>
          <div className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder="Location or remote" aria-label="Location" /></div>
          <div className="relative"><CalendarClock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder="Closing before…" type="date" aria-label="Deadline" /></div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><BadgeCheck className="h-3 w-3" />Verified source shown on every listing</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><Bookmark className="h-3 w-3" />Save & checklist</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><Bell className="h-3 w-3" />Optional reminders</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><Flag className="h-3 w-3" />Report suspicious listings</span>
        </div>
        <EmptyState icon={program.icon} title={`No ${program.name} listings yet`} text="Yuni staff review every listing before it appears here. Check back soon." action={<Button onClick={notReady}>Suggest an opportunity</Button>} />
      </section>

      <section aria-labelledby="tracker">
        <h2 id="tracker" className="mb-4 text-xl font-semibold">My applications</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {["Saved", "Preparing", "Applied", "Outcome"].map((s) => (
            <div key={s} className="rounded-2xl border bg-card p-4">
              <p className="text-sm font-semibold">{s}</p>
              <p className="mt-2 text-3xl font-semibold text-primary">0</p>
              <p className="text-xs text-muted-foreground">Only you can see this</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
