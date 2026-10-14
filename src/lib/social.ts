import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileStat = {
  id: string; username: string; display_name: string; bio: string; discoverable: boolean; is_private: boolean; followers: number; following: number;
};

export const MAX_PHOTOS = 5;

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });
}

export function useProfiles(opts: { search?: string; top?: boolean; ids?: string[] } = {}) {
  return useQuery({
    queryKey: ["profiles", opts],
    queryFn: async (): Promise<ProfileStat[]> => {
      let q = supabase.rpc("profile_directory").select("*");
      if (opts.ids) q = q.in("id", opts.ids.length ? opts.ids : ["00000000-0000-0000-0000-000000000000"]);
      else q = q.eq("discoverable", true);
      if (opts.search) {
        const s = opts.search.replace(/[%,()]/g, "");
        q = q.or(`username.ilike.%${s}%,display_name.ilike.%${s}%`);
      }
      q = opts.top ? q.order("followers", { ascending: false }).limit(6) : q.order("username").limit(30);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, followers: Number(p.followers), following: Number(p.following) })) as ProfileStat[];
    },
  });
}

export function useMyFollowing(me: string | null | undefined) {
  return useQuery({
    queryKey: ["following", me],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase.from("follows").select("following_id").eq("follower_id", me!);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.following_id));
    },
  });
}

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ me, target, following }: { me: string; target: string; following: boolean }) => {
      const res = following
        ? await supabase.from("follows").delete().eq("follower_id", me).eq("following_id", target)
        : await supabase.from("follows").insert({ follower_id: me, following_id: target });
      if (res.error) throw res.error;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function profileUrl(username: string) {
  return `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`;
}

export async function shareProfile(username: string, name: string) {
  const url = profileUrl(username);
  if (navigator.share) { try { await navigator.share({ title: `${name} on Yuni Circle`, url }); return "shared"; } catch { /* fall back to copy */ } }
  await navigator.clipboard.writeText(url);
  return "copied";
}

export function formatCount(n: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}
