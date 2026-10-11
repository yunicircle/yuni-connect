import { Link } from "@tanstack/react-router";
import logo from "@/assets/yuni-logo.jpeg.asset.json";

export function Brand({ to = "/" }: { to?: "/" | "/home" }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display text-xl font-semibold text-foreground" aria-label="Yuni Circle home">
      <img src={logo.url} alt="" className="h-10 w-10 rounded-lg object-cover object-top mix-blend-multiply" />
      Yuni Circle
    </Link>
  );
}

export const logoUrl = logo.url;
