import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState } from "@/components/feature";
import { ProfileCard } from "@/components/profile-card";
import { useMe, useMyFollowing, useProfiles } from "@/lib/social";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => meta("Find friends", "Search members by username and follow people you know."),
  component: Page,
});

function Page() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"search" | "following">("search");
  useEffect(() => { const t = setTimeout(() => setSearch(text.trim()), 300); return () => clearTimeout(t); }, [text]);
  const { data: me } = useMe();
  const { data: following } = useMyFollowing(me);
  const results = useProfiles(tab === "search" ? { search } : { ids: [...(following ?? [])], search });

  return (
    <div>
      <PageHeader title="Find friends" description="Search by username or display name. Only members who chose to be discoverable appear in search." />
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search @username or name" className="pl-9" aria-label="Search members" />
      </div>
      <div className="mb-4 flex gap-2" role="tablist">
        {(["search", "following"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t === "search" ? "All members" : `Following (${following?.size ?? 0})`}
          </button>
        ))}
      </div>
      {results.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
        : results.data?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">{results.data.map((p) => <ProfileCard key={p.id} p={p} />)}</div>
        ) : <EmptyState icon={Users} title="No members found" text={tab === "following" ? "You aren't following anyone yet." : "Try a different username."} />}
    </div>
  );
}
