import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, UserPlus, Image, Expand, RefreshCw } from "lucide-react";
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
  const samples = !searching && !profiles.length;
  const people = samples ? samplePhotos.map((photo) => photo.profile) : profiles;
  const [selected, setSelected] = useState<DiscoveryPhoto | null>(null);
  useEffect(() => { api?.reInit(); }, [api, people.length]);
  return <>
    <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{samples ? "Sample profiles · fictional people" : "People to connect with"}</span><div className="flex gap-1"><Button variant="outline" size="icon" aria-label="Previous profiles" onClick={() => api?.scrollPrev()}><ArrowLeft /></Button><Button variant="outline" size="icon" aria-label="Next profiles" onClick={() => api?.scrollNext()}><ArrowRight /></Button></div></div>
    {!people.length ? <p className="border-y py-8 text-center text-sm text-muted-foreground">No matching friends. Try another username.</p> : <div ref={ref} className="overflow-hidden"><div className="-ml-3 flex touch-pan-y">{people.map((profile) => {
      const photo = (samples ? samplePhotos : photos).find((photo) => photo.profile.id === profile.id);
      return <div key={profile.id} className="min-w-0 flex-[0_0_78%] pl-3 sm:flex-[0_0_40%] lg:flex-[0_0_32%]"><article className="overflow-hidden rounded-lg border bg-card"><Button variant="ghost" disabled={!photo} aria-label={`View ${profile.display_name}'s photo`} className="block h-auto w-full rounded-none p-0" onClick={() => setSelected(photo ?? null)}>{photo ? <img src={photo.url} alt={`${profile.display_name}'s profile`} loading="lazy" width={768} height={1024} className="aspect-[4/3] w-full object-cover object-top" /> : <span className="flex aspect-[4/3] w-full items-center justify-center bg-primary-soft text-4xl text-primary">{profile.display_name.charAt(0) || profile.username.charAt(0)}</span>}</Button><div className="space-y-2 p-3"><div><p className="truncate font-semibold">{profile.display_name || profile.username}</p><p className="truncate text-xs text-muted-foreground">@{profile.username}</p></div><p className="truncate text-xs text-muted-foreground">{samples ? "Sample profile" : `${formatCount(profile.followers)} followers`}</p><FollowAction profile={profile} me={me} sample={samples} onFollow={() => api?.scrollNext()} /></div></article></div>;
    })}</div></div>}
    <PhotoViewer photo={selected} me={me} onClose={() => setSelected(null)} onNext={() => { setSelected(null); api?.scrollNext(); }} />
  </>;
}

export function SuggestedPhotos({ photos, me, loading, error, onRetry }: { photos: DiscoveryPhoto[]; me: string | null | undefined; loading: boolean; error: boolean; onRetry: () => void }) {
  const [currentId, setCurrentId] = useState<string>();
  const [open, setOpen] = useState(false);
  const samples = !photos.length && !loading && !error;
  const items = samples ? samplePhotos : photos;
  const current = items.find((photo) => photo.id === currentId) ?? items[0];
  function next() { setCurrentId(nextSuggestion(items, current?.id)?.id); }
  if (loading) return <div className="h-80 animate-pulse rounded-lg bg-muted" role="status" aria-label="Loading member photos" />;
  if (error) return <div role="alert" className="flex items-center justify-between border-y py-6"><p className="text-sm">Member photos couldn't load.</p><Button variant="outline" onClick={onRetry}><RefreshCw />Retry</Button></div>;
  if (!current) return null;
  return <>
    <div className="mb-3 flex items-center justify-between"><p className="text-xs text-muted-foreground">{samples ? "Sample photos · fictional people" : "From discoverable member profiles"}</p><Button variant="ghost" size="sm" onClick={next} aria-label="Next suggested photo">Next photo<ArrowRight /></Button></div>
    <article className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
      <Button variant="ghost" className="relative block h-auto w-full rounded-none p-0" aria-label={`View photo by ${current.profile.display_name}`} onClick={() => setOpen(true)}><img src={current.url} alt={`Profile photo by ${current.profile.display_name}`} loading="lazy" width={768} height={1024} className="aspect-[4/5] max-h-[480px] w-full object-cover object-top" /><span className="absolute bottom-3 right-3 rounded-md bg-background/90 p-2 text-foreground"><Expand /></span></Button>
      <div className="flex flex-col justify-center gap-4 p-5"><span className="flex items-center gap-2 text-xs font-medium text-primary"><Image className="size-4" />{samples ? "Sample photo" : "Profile spotlight"}</span><div><h3 className="text-2xl font-semibold">{current.profile.display_name || current.profile.username}</h3><p className="break-all text-sm text-muted-foreground">@{current.profile.username}</p></div><p className="text-sm leading-relaxed text-muted-foreground">{current.profile.bio}</p>{!samples && <p className="text-xs text-muted-foreground">{formatCount(current.profile.followers)} followers</p>}<FollowAction profile={current.profile} me={me} sample={current.sample} onFollow={next} /><Button variant="outline" onClick={next}>Skip<ArrowRight /></Button></div>
    </article>
    <PhotoViewer photo={open ? current : null} me={me} onClose={() => setOpen(false)} onNext={next} />
  </>;
}

function PhotoViewer({ photo, me, onClose, onNext }: { photo: DiscoveryPhoto | null; me: string | null | undefined; onClose: () => void; onNext: () => void }) {
  return <Dialog open={!!photo} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">{photo && <><DialogTitle>{photo.profile.display_name}'s photo</DialogTitle><DialogDescription>{photo.sample ? "Fictional sample profile" : `@${photo.profile.username}`}</DialogDescription><img src={photo.url} alt={`Profile photo by ${photo.profile.display_name}`} width={768} height={1024} className="max-h-[55dvh] w-full rounded-md object-contain" /><FollowAction profile={photo.profile} me={me} sample={photo.sample} onFollow={onNext} /><Button variant="outline" onClick={onNext}>Next photo<ArrowRight /></Button></>}</DialogContent></Dialog>;
}
