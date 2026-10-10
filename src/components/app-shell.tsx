import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Home, Users, Compass, CalendarDays, User, MessageCircle, Heart, Briefcase, Scale, HandCoins, Bell, Search, Shield, LogOut,
} from "lucide-react";
import { Brand } from "./brand";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const main = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/community", label: "Community", icon: Users },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const more = [
  { to: "/members", label: "Members", icon: Search },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/dating", label: "Dating", icon: Heart },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/rights", label: "Rights & Support", icon: Scale },
  { to: "/funding", label: "Funding", icon: HandCoins },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

const linkCls = "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const activeCls = "bg-accent text-accent-foreground";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="rainbow-line" />
      <aside className="fixed inset-y-0 left-0 top-[3px] hidden w-64 flex-col border-r bg-sidebar p-4 md:flex">
        <div className="mb-6 px-2"><Brand to="/home" /></div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Main">
          {main.map((l) => (
            <Link key={l.to} to={l.to} className={linkCls} activeProps={{ className: activeCls }}>
              <l.icon className="h-4 w-4" aria-hidden />{l.label}
            </Link>
          ))}
          <p className="mt-4 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">More</p>
          {more.map((l) => (
            <Link key={l.to} to={l.to} className={linkCls} activeProps={{ className: activeCls }}>
              <l.icon className="h-4 w-4" aria-hidden />{l.label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className={linkCls}><LogOut className="h-4 w-4" aria-hidden />Sign out</button>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Brand to="/home" />
        <div className="flex gap-1">
          <Link to="/messages" aria-label="Messages" className="rounded-full p-2 hover:bg-accent"><MessageCircle className="h-5 w-5" /></Link>
          <Link to="/notifications" aria-label="Notifications" className="rounded-full p-2 hover:bg-accent"><Bell className="h-5 w-5" /></Link>
        </div>
      </header>

      <div className="md:pl-64"><main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:px-8 md:pb-12">{children}</main></div>

      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {main.map((l) => (
          <Link key={l.to} to={l.to} className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <l.icon className="h-5 w-5" aria-hidden />{l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
