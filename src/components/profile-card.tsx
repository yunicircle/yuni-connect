import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCount, useMe, useMyFollowing, useToggleFollow, type ProfileStat } from "@/lib/social";

export function ProfileCard({ p }: { p: ProfileStat }) {
  const { data: me } = useMe();
  const { data: following } = useMyFollowing(me);
  const toggle = useToggleFollow();
  const isFollowing = following?.has(p.id) ?? false;
  const isMe = me === p.id;
  const initial = (p.display_name || p.username).charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary" aria-hidden>{initial}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{p.display_name || p.username}</p>
        <p className="truncate text-sm text-muted-foreground">@{p.username}</p>
        <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{formatCount(p.followers)}</span> followers · {formatCount(p.following)} following</p>
      </div>
      {!isMe && me && (
        <Button size="sm" variant={isFollowing ? "outline" : "default"} disabled={toggle.isPending}
          onClick={() => toggle.mutate({ me, target: p.id, following: isFollowing }, { onError: (e) => toast.error(e.message) })}
          aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${p.username}`}>
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
      {isMe && <span className="text-xs font-medium text-primary">You</span>}
    </div>
  );
}
