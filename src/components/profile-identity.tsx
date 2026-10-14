import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X, Lock, Globe, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { MAX_PHOTOS, formatCount, profileUrl, shareProfile, useMe, useProfiles } from "@/lib/social";

export function ProfileIdentity() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { data: rows } = useProfiles(me ? { ids: [me] } : { ids: [] });
  const p = rows?.[0];
  const [form, setForm] = useState({ username: "", display_name: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (p) setForm({ username: p.username, display_name: p.display_name, bio: p.bio }); }, [p?.id]);

  const photos = useQuery({
    queryKey: ["photos", me],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase.from("profile_photos").select("id,path").eq("user_id", me!).order("created_at");
      if (error) throw error;
      if (!data.length) return [];
      const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrls(data.map((d) => d.path), 3600);
      return data.map((d, i) => ({ ...d, url: signed?.[i]?.signedUrl ?? "" }));
    },
  });

  async function save() {
    if (!me) return;
    const username = form.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(username)) { toast.error("Username: 3–24 lowercase letters, numbers or _"); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ username, display_name: form.display_name.trim(), bio: form.bio.trim() }).eq("id", me);
    setSaving(false);
    if (error) { toast.error(error.code === "23505" ? "That username is taken" : error.message); return; }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profiles"] });
  }

  async function upload(files: FileList | null) {
    if (!me || !files?.length) return;
    const room = MAX_PHOTOS - (photos.data?.length ?? 0);
    const list = Array.from(files).slice(0, room);
    if (files.length > room) toast.error(`You can have up to ${MAX_PHOTOS} photos`);
    for (const f of list) {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); continue; }
      const path = `${me}/${crypto.randomUUID()}-${f.name.replace(/[^\w.]/g, "")}`;
      const up = await supabase.storage.from("profile-photos").upload(path, f);
      if (up.error) { toast.error(up.error.message); continue; }
      const ins = await supabase.from("profile_photos").insert({ user_id: me, path });
      if (ins.error) { await supabase.storage.from("profile-photos").remove([path]); toast.error(ins.error.message); }
    }
    if (fileRef.current) fileRef.current.value = "";
    qc.invalidateQueries({ queryKey: ["photos"] });
  }

  async function remove(id: string, path: string) {
    await supabase.from("profile_photos").delete().eq("id", id);
    await supabase.storage.from("profile-photos").remove([path]);
    qc.invalidateQueries({ queryKey: ["photos"] });
  }

  const count = photos.data?.length ?? 0;
  async function setPrivate(v: boolean) {
    if (!me) return;
    const { error } = await supabase.from("profiles").update({ is_private: v }).eq("id", me);
    if (error) { toast.error(error.message); return; }
    toast.success(v ? "Your account is now private" : "Your account is now public");
    qc.invalidateQueries({ queryKey: ["profiles"] });
  }

  return (
    <section className="rounded-3xl border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-center gap-6">
        <div><p className="text-2xl font-semibold">{p ? formatCount(p.followers) : "–"}</p><p className="text-sm text-muted-foreground">Followers</p></div>
        <div><p className="text-2xl font-semibold">{p ? formatCount(p.following) : "–"}</p><p className="text-sm text-muted-foreground">Following</p></div>
        <p className="text-xs text-muted-foreground">Follower counts are visible to all members.</p>
      </div>

      {p && <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-muted p-3 text-sm">
        <span className="min-w-0 flex-1 truncate">Your link: <Link to="/u/$username" params={{ username: p.username }} className="font-medium text-primary underline-offset-2 hover:underline">{profileUrl(p.username).replace(/^https?:\/\//, "")}</Link></span>
        <Button size="sm" variant="outline" onClick={async () => { const r = await shareProfile(p.username, p.display_name || p.username); if (r === "copied") toast.success("Profile link copied"); }}><Share2 className="h-4 w-4" />Share</Button>
      </div>}

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border p-4">
        <div className="flex items-start gap-3">{p?.is_private ? <Lock className="mt-0.5 h-5 w-5 text-primary" /> : <Globe className="mt-0.5 h-5 w-5 text-primary" />}
          <div><p className="font-semibold">{p?.is_private ? "Private account" : "Public account"}</p><p className="text-sm text-muted-foreground">{p?.is_private ? "Only your followers can see your photos and bio. You won't appear in Discover photos." : "Any signed-in member can see your photos and bio."}</p></div></div>
        <Switch checked={!!p?.is_private} disabled={!p} onCheckedChange={setPrivate} aria-label="Private account" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Username
          <div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input className="pl-7" value={form.username} maxLength={24} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
        </label>
        <label className="text-sm font-medium">Display name
          <Input className="mt-1" value={form.display_name} maxLength={50} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="A pseudonym is fine" />
        </label>
        <label className="text-sm font-medium sm:col-span-2">Bio
          <Textarea className="mt-1" value={form.bio} maxLength={300} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
      </div>
      <Button className="mt-4" onClick={save} disabled={saving || !p}>{saving ? "Saving…" : "Save profile"}</Button>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Photos <span className="text-sm font-normal text-muted-foreground">({count}/{MAX_PHOTOS})</span></h3>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <Button size="sm" variant="outline" disabled={count >= MAX_PHOTOS} onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" />Add photos</Button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.data?.map((ph) => (
            <div key={ph.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <img src={ph.url} alt="Profile photo" className="h-full w-full object-cover" />
              <button onClick={() => remove(ph.id, ph.path)} aria-label="Remove photo" className="absolute right-1 top-1 rounded-full bg-background/90 p-1"><X className="h-3 w-3" /></button>
            </div>
          ))}
          {Array.from({ length: MAX_PHOTOS - count }).map((_, i) => <div key={i} className="aspect-square rounded-xl border border-dashed" />)}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Up to {MAX_PHOTOS} photos, 5 MB each. {p?.is_private ? "Only your followers can view them." : "Only signed-in members can view them."}</p>
      </div>
    </section>
  );
}
