import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, UserPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { formatCount, useToggleFollow, type ProfileStat } from "@/lib/social";
import { nextSuggestion, followThenAdvance } from "@/lib/discover-feed";
import { samplePhotos, type DiscoveryPhoto } from "@/lib/discover-samples";

export function useDiscoveryPhotos(profiles: ProfileStat[], me: string | null | undefined) {
  const ids = profiles.map((p) => p.id).sort();
  return useQuery({
    queryKey: ["discover-photos", me, ids], enabled: !!me,
    queryFn: async (): Promise<DiscoveryPhoto[]> => {
      if (!ids.length) return [];
      const { data, error } = await supabase.from("profile_photos").select("id,user_id,path").in("user_id", ids).order("created_at", { ascending: false }).limit(150);
      if (error) throw error;
      const seen = new Set<string>();
      const featured = (data ?? []).filter((photo) => { if (seen.has(photo.user_id)) return false; seen.add(photo.user_id); return true; });
      if (!featured.length) return [];
      const signed = await supabase.storage.from("profile-photos").createSignedUrls(featured.map((photo) => photo.path), 300);
      if (signed.error) throw signed.error;
      return featured.flatMap((photo, index) => {
        const profile = profiles.find((p) => p.id === photo.user_id);
        const url = signed.data?.[index]?.signedUrl;
        return profile && url ? [{ id: photo.id, url, profile }] : [];
      });
    }, staleTime: 180000, refetchInterval: 240000,
  });
}

function FollowAction({ profile, me, sample, onFollow }: { profile: ProfileStat; me: string | null | undefined; sample?: boolean; onFollow?: () => void }) {
  const toggle = useToggleFollow();
  async function follow() {
    if (sample) { toast.info("Sample profile — no real account was followed"); onFollow?.(); return; }
    if (!me) return;
    try {
      await followThenAdvance(() => toggle.mutateAsync({ me, target: profile.id, following: false }), () => { toast.success(`Following @${profile.username}`); onFollow?.(); });
    } catch { toast.error("Couldn't follow this member. Please try again."); }
  }
  return <Button disabled={toggle.isPending || !me} onClick={follow} aria-label={sample ? `Try following sample ${profile.display_name}` : `Follow ${profile.username}`} className="w-full"><UserPlus />{toggle.isPending ? "Following…" : sample ? "Try follow · sample" : "Follow"}</Button>;
}

export function SuggestedPeople({ profiles, photos, me, searching }: { profiles: ProfileStat[]; photos: DiscoveryPhoto[]; me: string | null | undefined; searching: boolean }) {
  const [ref, api] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  const samples = !profiles.length;
  const people = samples ? samplePhotos.map((photo) => photo.profile) : profiles;
  const [selected, setSelected] = useState<DiscoveryPhoto | null>(null);
  useEffect(() => { api?.reInit(); }, [api, people.length]);
  return <>
    <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{samples ? (searching ? "No match — sample suggestions · fictional" : "Sample profiles · fictional people") : "People to connect with"}</span><div className="flex gap-1"><Button variant="outline" size="icon" aria-label="Previous profiles" onClick={() => api?.scrollPrev()}><ArrowLeft /></Button><Button variant="outline" size="icon" aria-label="Next profiles" onClick={() => api?.scrollNext()}><ArrowRight /></Button></div></div>
    {<div ref={ref} className="overflow-hidden"><div className="-ml-3 flex touch-pan-y">{people.map((profile) => {
      const photo = (samples ? samplePhotos : photos).find((photo) => photo.profile.id === profile.id);
      return <div key={profile.id} className="min-w-0 flex-[0_0_78%] pl-3 sm:flex-[0_0_40%] lg:flex-[0_0_32%]"><article className="overflow-hidden rounded-lg border bg-card"><Button variant="ghost" disabled={!photo} aria-label={`View ${profile.display_name}'s photo`} className="block h-auto w-full rounded-none p-0" onClick={() => setSelected(photo ?? null)}>{photo ? <img src={photo.url} alt={`${profile.display_name}'s profile`} loading="lazy" width={768} height={1024} className="aspect-[4/3] w-full object-cover object-top" /> : <span className="flex aspect-[4/3] w-full items-center justify-center bg-primary-soft text-4xl text-primary">{profile.display_name.charAt(0) || profile.username.charAt(0)}</span>}</Button><div className="space-y-2 p-3"><div>{samples ? <p className="truncate font-semibold">{profile.display_name}</p> : <Link to="/u/$username" params={{ username: profile.username }} className="block truncate font-semibold hover:underline">{profile.display_name || profile.username}</Link>}<p className="truncate text-xs text-muted-foreground">@{profile.username}</p></div><p className="truncate text-xs text-muted-foreground">{samples ? "Sample profile" : `${formatCount(profile.followers)} followers`}</p><FollowAction profile={profile} me={me} sample={samples} onFollow={() => api?.scrollNext()} /></div></article></div>;
    })}</div></div>}
    <PhotoViewer photo={selected} me={me} onClose={() => setSelected(null)} onNext={() => { setSelected(null); api?.scrollNext(); }} />
  </>;
}

export function SuggestedPhotos({ photos, me, loading, error, onRetry }: { photos: DiscoveryPhoto[]; me: string | null | undefined; loading: boolean; error: boolean; onRetry: () => void }) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const items = [...photos, ...(photos.length < 6 ? samplePhotos : [])];
  const current = items.find((photo) => photo.id === currentId) ?? null;
  function next() { setCurrentId(nextSuggestion(items, current?.id)?.id ?? null); }
  if (loading) return <div className="grid grid-cols-3 gap-1">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square animate-pulse bg-muted" />)}</div>;
  if (error) return <div role="alert" className="flex items-center justify-between border-y py-6"><p className="text-sm">Member photos couldn't load.</p><Button variant="outline" onClick={onRetry}><RefreshCw />Retry</Button></div>;
  return <>
    <p className="mb-2 text-xs text-muted-foreground">{photos.length ? "From public member profiles" : "Sample photos · fictional people"}{photos.length > 0 && photos.length < 6 ? " · plus fictional samples" : ""}</p>
    <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
      {items.map((photo, i) => <button key={photo.id} onClick={() => setCurrentId(photo.id)} aria-label={`View photo by ${photo.profile.display_name}`} className={`group relative overflow-hidden bg-muted focus-visible:outline-2 focus-visible:outline-primary ${i % 10 === 0 ? "col-span-2 row-span-2" : ""}`}>
        <img src={photo.url} alt={`Profile photo by ${photo.profile.display_name}`} loading="lazy" className="aspect-square h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-foreground/70 to-transparent px-2 pb-1.5 pt-6 text-left text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">@{photo.profile.username}{photo.sample ? " · sample" : ""}</span>
        {photo.sample && <span className="absolute left-1.5 top-1.5 rounded bg-background/85 px-1.5 text-[10px] font-medium">Sample</span>}
      </button>)}
    </div>
    <PhotoViewer photo={current} me={me} onClose={() => setCurrentId(null)} onNext={next} />
  </>;
}

function PhotoViewer({ photo, me, onClose, onNext }: { photo: DiscoveryPhoto | null; me: string | null | undefined; onClose: () => void; onNext: () => void }) {
  return <Dialog open={!!photo} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">{photo && <><DialogTitle>{photo.profile.display_name}'s photo</DialogTitle><DialogDescription>{photo.sample ? "Fictional sample profile" : <Link to="/u/$username" params={{ username: photo.profile.username }} className="text-primary hover:underline">@{photo.profile.username}</Link>}</DialogDescription><img src={photo.url} alt={`Profile photo by ${photo.profile.display_name}`} width={768} height={1024} className="max-h-[55dvh] w-full rounded-md object-contain" /><FollowAction profile={photo.profile} me={me} sample={photo.sample} onFollow={onNext} /><Button variant="outline" onClick={onNext}>Next photo<ArrowRight /></Button></>}</DialogContent></Dialog>;
}
