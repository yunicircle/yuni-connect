import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Bookmark, Search, Sparkles, X, Megaphone, Heart, Briefcase, Scale, HandCoins, Users, CalendarDays, RefreshCw, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCard } from "@/components/profile-card";
import { DiscoverPostCard } from "@/components/discover-post";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useMyFollowing, useProfiles } from "@/lib/social";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => meta("Discover your circle", "Find friends, follow suggested profiles and explore the latest Yuni Circle posts and announcements."),
  component: Page,
});

const categories = [
  { to: "/community", label: "Community", caption: "Find your people", icon: Users, color: "bg-primary-soft text-primary" },
  { to: "/events", label: "Events", caption: "Make a connection", icon: CalendarDays, color: "bg-success/10 text-success" },
  { to: "/opportunities", label: "Opportunities", caption: "Take your next step", icon: Briefcase, color: "bg-warning/10 text-warning" },
  { to: "/dating", label: "Dating", caption: "A little chemistry", icon: Heart, color: "bg-destructive/10 text-destructive" },
  { to: "/rights", label: "Rights & Support", caption: "Support that matters", icon: Scale, color: "bg-accent text-accent-foreground" },
  { to: "/funding", label: "Funding", caption: "Grow together", icon: HandCoins, color: "bg-success/10 text-success" },
] as const;

function Page() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [feed, setFeed] = useState("latest");
  const [bookmarks, setBookmarks] = useState<{ user: string; ids: string[] } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const { data: me } = useMe();
  const following = useMyFollowing(me);
  const profiles = useProfiles({ search: search.replace(/^@/, "") });
  const announcements = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 250);
    return () => clearTimeout(timer);
  }, [text]);
  useEffect(() => {
    if (!me) { setBookmarks(null); return; }
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(`yuni:discover:saved:${me}`) ?? "[]");
      setBookmarks({ user: me, ids: Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [] });
    } catch { setBookmarks({ user: me, ids: [] }); }
  }, [me]);
  useEffect(() => {
    if (announcements.data?.length && window.location.hash.startsWith("#post-")) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "center" });
    }
  }, [announcements.data]);
  const saved = bookmarks?.user === me ? bookmarks.ids : [];
  function toggleSave(id: string) {
    if (!me) return;
    const ids = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setBookmarks({ user: me, ids });
    try { localStorage.setItem(`yuni:discover:saved:${me}`, JSON.stringify(ids)); } catch { /* Keep working in memory when device storage is unavailable. */ }
  }
  const suggested = (profiles.data ?? []).filter((p) => p.id !== me && (search || !following.data?.has(p.id))).sort((a, b) => b.followers - a.followers);
  const posts = (announcements.data ?? []).filter((post) => feed !== "saved" || saved.includes(post.id));

  return (
    <div className="space-y-9">
      <section aria-labelledby="discover-heading" className="border-b pb-7">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"><Compass className="size-4" aria-hidden />Your circle, a little wider</div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h1 id="discover-heading" className="text-4xl font-semibold">Discover</h1>
          <Button asChild variant="ghost" className="px-0 text-primary"><Link to="/members">Find friends<ArrowRight /></Link></Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" aria-hidden />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Find friends by name or @username" aria-label="Find friends by name or username" className="h-14 rounded-lg bg-card pl-12 pr-12 text-base shadow-soft" />
          {text && <Button size="icon" variant="ghost" aria-label="Clear friend search" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => { setText(""); setSearch(""); }}><X /></Button>}
        </div>
      </section>

      <section aria-labelledby="profiles-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="profiles-heading" className="flex items-center gap-2 text-xl font-semibold"><Sparkles className="size-5 text-primary" aria-hidden />{search ? "People you’re looking for" : "Suggested profiles"}</h2>
          <div className="flex shrink-0 gap-1">
            <Button variant="outline" size="icon" aria-label="Previous profiles" title="Previous profiles" onClick={() => scroller.current?.scrollBy({ left: -320, behavior: "smooth" })}><ArrowLeft /></Button>
            <Button variant="outline" size="icon" aria-label="Next profiles" title="Next profiles" onClick={() => scroller.current?.scrollBy({ left: 320, behavior: "smooth" })}><ArrowRight /></Button>
          </div>
        </div>
        {profiles.isError ? <ErrorNotice text="Profiles couldn't load." onRetry={() => profiles.refetch()} />
          : profiles.isPending || following.isPending ? <div className="grid animate-pulse gap-3 sm:grid-cols-2" role="status" aria-label="Loading profiles">{[0, 1].map((i) => <div key={i} className="h-24 rounded-lg bg-muted" />)}</div>
          : suggested.length ? <div ref={scroller} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3" aria-label="Suggested profiles">{suggested.map((p) => <div key={p.id} className="w-full min-w-0 shrink-0 snap-start sm:w-[calc(50%-6px)]"><ProfileCard p={p} /></div>)}</div>
          : <QuietState icon={Users} title={search ? "No matching friends" : "Your next connection is on its way"} text={search ? "Try another name or username." : "No new suggested profiles right now."}><Button asChild variant="outline" size="sm"><Link to="/members">Browse members<ArrowRight /></Link></Button></QuietState>}
      </section>

      <section aria-labelledby="posts-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="posts-heading" className="text-xl font-semibold">Suggested posts</h2>
          <Button variant="ghost" size="icon" aria-label="Refresh posts" title="Refresh posts" disabled={announcements.isFetching} onClick={() => announcements.refetch()}><RefreshCw className={announcements.isFetching ? "animate-spin" : ""} /></Button>
        </div>
        <Tabs value={feed} onValueChange={setFeed} className="mb-5">
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted p-1">
            <TabsTrigger value="latest" className="gap-2"><Sparkles className="size-4" />For you</TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2"><Megaphone className="size-4" />Announcements</TabsTrigger>
            <TabsTrigger value="saved" className="gap-2"><Bookmark className="size-4" />Saved{saved.length > 0 ? ` (${saved.length})` : ""}</TabsTrigger>
          </TabsList>
        </Tabs>
        {announcements.isError ? <ErrorNotice text="Posts couldn't load." onRetry={() => announcements.refetch()} />
          : announcements.isPending ? <div role="status" aria-label="Loading posts" className="h-48 animate-pulse rounded-lg bg-muted" />
          : posts.length ? <div className="grid items-start gap-4 lg:grid-cols-2">{posts.map((post) => <DiscoverPostCard key={post.id} post={post} saved={saved.includes(post.id)} onSave={() => toggleSave(post.id)} />)}</div>
          : <QuietState icon={feed === "saved" ? Bookmark : Megaphone} title={feed === "saved" ? "Your saved posts" : "A fresh chapter is coming"} text={feed === "saved" ? "No posts saved on this device yet." : "No announcements have been published yet."}>{feed === "saved" ? <Button size="sm" variant="outline" onClick={() => setFeed("latest")}>Back to posts<ArrowRight /></Button> : <Button asChild size="sm" variant="outline"><Link to="/community">Visit the community<ArrowRight /></Link></Button>}</QuietState>}
      </section>

      <section aria-labelledby="explore-heading" className="border-t pt-7">
        <div className="mb-5 flex items-center justify-between"><h2 id="explore-heading" className="text-xl font-semibold">More to discover</h2><span className="text-xs text-muted-foreground">Connect. Belong. Thrive.</span></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {categories.map((c) => <Button key={c.to} asChild variant="outline" className="h-auto min-h-36 justify-start whitespace-normal rounded-lg bg-card p-4 text-left shadow-soft"><Link to={c.to} className="group flex flex-col items-start gap-3"><div className="flex w-full items-center justify-between"><span className={`flex size-10 items-center justify-center rounded-lg ${c.color}`}><c.icon className="size-5" aria-hidden /></span><ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-1 motion-reduce:transition-none" /></div><div><p className="font-semibold">{c.label}</p><p className="mt-1 text-xs font-normal text-muted-foreground">{c.caption}</p></div></Link></Button>)}
        </div>
      </section>
    </div>
  );
}

function QuietState({ icon: Icon, title, text, children }: { icon: typeof Users; title: string; text: string; children?: React.ReactNode }) {
  return <div className="flex flex-col items-center border-y border-dashed py-9 text-center"><Icon className="mb-3 size-7 text-muted-foreground" aria-hidden /><h3 className="text-lg font-semibold">{title}</h3><p className="mb-4 mt-1 text-sm text-muted-foreground">{text}</p>{children}</div>;
}
function ErrorNotice({ text, onRetry }: { text: string; onRetry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 p-4"><p className="text-sm text-muted-foreground">{text}</p><Button variant="outline" size="sm" onClick={onRetry}><RefreshCw />Retry</Button></div>;
}
