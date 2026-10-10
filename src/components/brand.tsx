import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: "/" | "/home" }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-rainbow p-[3px]">
        <span className="h-full w-full rounded-full bg-background" />
      </span>
      Yuni Circle
    </Link>
  );
}
