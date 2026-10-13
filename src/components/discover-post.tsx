import { useState } from "react";
import { Bookmark, Check, Copy, ArrowUpRight, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type DiscoverPost = { id: string; title: string; body: string; created_at: string };

export function DiscoverPostCard({ post, saved, onSave }: { post: DiscoverPost; saved: boolean; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const date = new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: "medium" });
  async function share() {
    const url = new URL("/discover", window.location.origin);
    url.hash = `post-${post.id}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      toast.success("Post link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Couldn't copy the link. Please try again."); }
  }
  return (
    <>
      <article id={`post-${post.id}`} className="scroll-mt-24 overflow-hidden rounded-lg border bg-card shadow-soft">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Megaphone className="size-4" aria-hidden /></span>
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Yuni Circle</p><time className="text-xs text-muted-foreground" dateTime={post.created_at}>{date}</time></div>
          <span className="text-xs font-medium text-success">Official</span>
        </div>
        <div className="px-5 py-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Announcement</p>
          <h3 className="break-words text-xl font-semibold">{post.title}</h3>
          <p className="mt-3 line-clamp-3 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">{post.body}</p>
        </div>
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <Button variant="ghost" onClick={() => setOpen(true)}>Read post<ArrowUpRight aria-hidden /></Button>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" title={saved ? "Unsave post" : "Save post on this device"} aria-label={`${saved ? "Unsave" : "Save"} ${post.title}`} aria-pressed={saved} onClick={onSave} className={saved ? "text-primary" : "text-muted-foreground"}><Bookmark className={saved ? "fill-current" : ""} /></Button>
            <Button variant="ghost" size="icon" title="Copy post link" aria-label={`Copy link to ${post.title}`} onClick={share}>{copied ? <Check /> : <Copy />}</Button>
          </div>
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogDescription>Yuni Circle · {date}</DialogDescription><DialogTitle className="break-words text-2xl leading-snug">{post.title}</DialogTitle></DialogHeader>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed">{post.body}</p>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={onSave}><Bookmark />{saved ? "Saved on this device" : "Save on this device"}</Button><Button variant="ghost" onClick={share}><Copy />Copy link</Button></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
