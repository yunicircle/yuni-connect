import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Lock, Plus, Users, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/feature";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/social";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => meta("Community groups", "Join public groups or request to join private ones with people who share your interests."),
  component: Page,
});

type Visibility = "public" | "private";

function Page() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", visibility: "public" as Visibility });
  const [manage, setManage] = useState<string | null>(null);

  const groups = useQuery({
    queryKey: ["groups", me], enabled: !!me,
    queryFn: async () => {
      const [g, m] = await Promise.all([
        supabase.from("groups").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("group_members").select("group_id,status").eq("user_id", me!),
      ]);
      if (g.error) throw g.error; if (m.error) throw m.error;
      const mine = new Map(m.data.map((r) => [r.group_id, r.status]));
      return g.data.map((x) => ({ ...x, myStatus: mine.get(x.id) }));
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["groups"] });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("groups").insert({ name: form.name.trim(), description: form.description.trim(), visibility: form.visibility, owner_id: me! });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Group created"); setCreating(false); setForm({ name: "", description: "", visibility: "public" }); refresh(); },
    onError: () => toast.error("Couldn't create the group. Names need 3–60 characters."),
  });

  async function join(id: string, isPublic: boolean) {
    const { error } = await supabase.from("group_members").insert({ group_id: id, user_id: me! });
    if (error) { toast.error("Couldn't join. Try again."); return; }
    toast.success(isPublic ? "You joined the group" : "Request sent — the owner will review it");
    refresh();
  }
  async function leave(id: string) {
    const { error } = await supabase.from("group_members").delete().eq("group_id", id).eq("user_id", me!);
    if (error) toast.error("Couldn't update membership."); else refresh();
  }

  return (
    <div>
      <PageHeader title="Community" description="Public groups are open to every member. Private groups need the owner's approval, and only members see who's inside." />
      <div className="mb-4 flex justify-end"><Button onClick={() => setCreating(true)}><Plus />Create a group</Button></div>
      {groups.isPending ? <div className="h-40 animate-pulse rounded-2xl bg-muted" role="status" aria-label="Loading groups" />
        : groups.isError ? <p role="alert" className="text-sm">Groups couldn't load. <Button variant="link" onClick={() => groups.refetch()}>Retry</Button></p>
        : !groups.data.length ? <EmptyState icon={Users} title="No groups yet" text="Start one for your city, interest or identity." />
        : <div className="grid gap-3 sm:grid-cols-2">{groups.data.map((g) => {
          const isPublic = g.visibility === "public"; const owner = g.owner_id === me;
          return <article key={g.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{g.name}</h3>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">{isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}{isPublic ? "Public" : "Private"}</span></div>
            {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
            <div className="mt-auto flex gap-2">
              {owner ? <><span className="text-xs font-medium text-primary self-center">You own this</span>{!isPublic && <Button size="sm" variant="outline" onClick={() => setManage(g.id)}>Requests</Button>}</>
                : g.myStatus === "active" ? <Button size="sm" variant="outline" onClick={() => leave(g.id)}>Leave</Button>
                : g.myStatus === "pending" ? <Button size="sm" variant="outline" onClick={() => leave(g.id)}>Requested · cancel</Button>
                : <Button size="sm" onClick={() => join(g.id, isPublic)}>{isPublic ? "Join" : "Request to join"}</Button>}
            </div>
          </article>;
        })}</div>}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogTitle>Create a group</DialogTitle>
          <DialogDescription>Choose who can join and see the member list.</DialogDescription>
          <Input placeholder="Group name" maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Group name" />
          <Textarea placeholder="What's it about? (optional)" maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} aria-label="Description" />
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Group privacy">
            {(["public", "private"] as const).map((v) => <button key={v} type="button" role="radio" aria-checked={form.visibility === v} onClick={() => setForm({ ...form, visibility: v })} className={`rounded-xl border p-3 text-left text-sm ${form.visibility === v ? "border-primary bg-primary-soft" : ""}`}>
              <span className="flex items-center gap-1 font-semibold">{v === "public" ? <Globe className="size-4" /> : <Lock className="size-4" />}{v === "public" ? "Public" : "Private"}</span>
              <span className="text-xs text-muted-foreground">{v === "public" ? "Anyone can join instantly." : "You approve each request."}</span></button>)}
          </div>
          <Button disabled={create.isPending || form.name.trim().length < 3} onClick={() => create.mutate()}>{create.isPending ? "Creating…" : "Create group"}</Button>
        </DialogContent>
      </Dialog>
      <Requests groupId={manage} onClose={() => setManage(null)} />
    </div>
  );
}

function Requests({ groupId, onClose }: { groupId: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const reqs = useQuery({
    queryKey: ["group-requests", groupId], enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase.from("group_members").select("user_id, profiles(username, display_name)").eq("group_id", groupId!).eq("status", "pending");
      if (error) throw error; return data;
    },
  });
  async function decide(userId: string, approve: boolean) {
    const q = supabase.from("group_members");
    const { error } = approve ? await q.update({ status: "active" }).eq("group_id", groupId!).eq("user_id", userId) : await q.delete().eq("group_id", groupId!).eq("user_id", userId);
    if (error) toast.error("Couldn't update request."); else { qc.invalidateQueries({ queryKey: ["group-requests"] }); toast.success(approve ? "Approved" : "Declined"); }
  }
  return <Dialog open={!!groupId} onOpenChange={(o) => { if (!o) onClose(); }}><DialogContent>
    <DialogTitle>Join requests</DialogTitle><DialogDescription>Only you, the owner, can see these.</DialogDescription>
    {reqs.data?.length ? reqs.data.map((r) => <div key={r.user_id} className="flex items-center justify-between gap-2 border-b py-2"><span className="text-sm">{r.profiles?.display_name} <span className="text-muted-foreground">@{r.profiles?.username}</span></span><div className="flex gap-1"><Button size="icon" aria-label="Approve" onClick={() => decide(r.user_id, true)}><Check /></Button><Button size="icon" variant="outline" aria-label="Decline" onClick={() => decide(r.user_id, false)}><X /></Button></div></div>)
      : <p className="text-sm text-muted-foreground">No pending requests.</p>}
  </DialogContent></Dialog>;
}
