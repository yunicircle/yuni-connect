import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Heart, CalendarDays, Scale, Briefcase, HandCoins, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => meta("Connect. Belong. Thrive.", "Yuni Circle is a privacy-first, global LGBTQ+ community for connection, events, rights, opportunities and mutual support."),
  component: Landing,
});

const features = [
  { icon: Users, title: "Community", text: "Groups, conversations and members who share your interests." },
  { icon: CalendarDays, title: "Events", text: "Meetups, workshops and virtual gatherings near you." },
  { icon: Heart, title: "Dating (optional)", text: "A separate, opt-in space for adults. Off by default." },
  { icon: Scale, title: "Rights & support", text: "Know your rights and reach verified support organisations." },
  { icon: Briefcase, title: "Opportunities", text: "Jobs, scholarships, grants, mentorship and inclusive businesses." },
  { icon: HandCoins, title: "Community funding", text: "Verified campaigns, mutual aid and grant programmes." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <div className="rainbow-line" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Brand />
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Join</Link></Button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:pt-20">
        <p className="mb-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">A global LGBTQ+ community</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] md:text-7xl">Connect. Belong. <span className="text-primary">Thrive.</span></h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">A safe, private home for LGBTQ+ people and allies. You decide what others see, from your name to whether you can be found at all.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Create your free account</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/auth">I already have one</Link></Button>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-soft">
            <f.icon className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-col gap-4 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center">
          <ShieldCheck className="h-10 w-10 shrink-0" aria-hidden />
          <div>
            <h2 className="text-2xl font-semibold">Privacy comes first</h2>
            <p className="mt-1 opacity-90">Use a pseudonym, hide your profile from search, block anyone, and delete your account and data at any time.</p>
          </div>
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© Yuni Circle · Connect. Belong. Thrive.</footer>
    </div>
  );
}
