import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock, Share2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCount, shareProfile, useMe, useMyFollowing, useToggleFollow, type ProfileStat } from "@/lib/social";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/u/$username")({
  head: ({ params }) => meta(`@${params.username}`, `See @${params.username}'s profile on Yuni Circle.`),
  component: Page,
});

function Page() {
  const { username } = Route.useParams();
  const { data: me } = useMe();
  const following = useMyFollowing(me);
  const toggle = useToggleFollow();
  const profile = useQuery({
    queryKey: ["profiles", "by-username", username],
    queryFn: async (): Promise<ProfileStat | null> => {
      const { data, error } = await supabase.rpc("profile_directory").select("*").eq("username", username.toLowerCase()).maybeSingle();
      if (error) throw error;
      return data ? { ...data, followers: Number(data.followers), following: Number(data.following) } as ProfileStat : null;
    },
  });
  const p = profile.data;
  const isMe = !!p && p.id === me;
  const isFollowing = !!p && !!following.data?.has(p.id);
  const canSee = !!p && (!p.is_private || isMe || isFollowing);
  const photos = useQuery({
    queryKey: ["photos", "profile", p?.id, canSee],
    enabled: !!p && canSee,
    queryFn: async () => {
      const { data, error } = await supabase.from("profile_photos").select("id,path").eq("user_id", p!.id).order("created_at");
      if (error) throw error;
      if (!data.length) return [];
      const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrls(data.map((d) => d.path), 300);
      return data.map((d, i) => ({ id: d.id, url: signed?.[i]?.signedUrl ?? "" })).filter((d) => d.url);
    },
  });

  if (profile.isPending) return <div className="h-48 animate-pulse rounded-lg bg-muted" role="status" aria-label="Loading profile" />;
  if (!p) return <div className="py-16 text-center"><UserRound className="mx-auto mb-3 size-8 text-muted-foreground" /><h1 className="text-2xl font-semibold">Profile not found</h1><p className="mt-1 text-sm text-muted-foreground">@{username} doesn't exist or changed their username.</p><Button asChild variant="outline" className="mt-4"><Link to="/discover">Back to Discover</Link></Button></div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary-soft text-4xl font-semibold text-primary ring-4 ring-background outline outline-2 outline-primary/30">{(p.display_name || p.username).charAt(0).toUpperCase()}</span>
        <div className="min-w-0 flex-1 space-y-3">
          <div><h1 className="flex items-center gap-2 text-2xl font-semibold">{p.display_name || p.username}{p.is_private && <Lock className="size-4 text-muted-foreground" aria-label="Private account" />}</h1><p className="text-sm text-muted-foreground">@{p.username}</p></div>
          <div className="flex gap-6 text-sm"><span><b>{photos.data?.length ?? (canSee ? "–" : "·")}</b> photos</span><span><b>{formatCount(p.followers)}</b> followers</span><span><b>{formatCount(p.following)}</b> following</span></div>
          <div className="flex gap-2">
            {isMe ? <Button asChild variant="outline"><Link to="/profile">Edit profile</Link></Button>
              : me && <Button variant={isFollowing ? "outline" : "default"} disabled={toggle.isPending} onClick={() => toggle.mutate({ me, target: p.id, following: isFollowing }, { onError: () => toast.error("Couldn't update follow. Try again.") })}>{isFollowing ? "Following" : "Follow"}</Button>}
            <Button variant="outline" onClick={async () => { if ((await shareProfile(p.username, p.display_name || p.username)) === "copied") toast.success("Profile link copied"); }}><Share2 />Share</Button>
          </div>
        </div>
      </header>
      {canSee && p.bio && <p className="text-sm leading-relaxed">{p.bio}</p>}
      <div className="border-t pt-4">
        {!canSee ? <div className="py-12 text-center"><Lock className="mx-auto mb-3 size-8 text-muted-foreground" /><h2 className="font-semibold">This account is private</h2><p className="mt-1 text-sm text-muted-foreground">Follow @{p.username} to see their photos and bio.</p></div>
          : photos.isPending ? <div className="grid grid-cols-3 gap-1">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-square animate-pulse bg-muted" />)}</div>
          : photos.data?.length ? <div className="grid grid-cols-3 gap-1">{photos.data.map((ph) => <img key={ph.id} src={ph.url} alt={`Photo by ${p.display_name || p.username}`} loading="lazy" className="aspect-square w-full object-cover" />)}</div>
          : <p className="py-12 text-center text-sm text-muted-foreground">No photos yet.</p>}
      </div>
    </div>
  );
}
