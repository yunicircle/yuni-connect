import type { ProfileStat } from "./social";

export function nextSuggestion<T extends { id: string }>(items: T[], currentId: string | undefined): T | undefined {
  if (!items.length) return undefined;
  const index = items.findIndex((item) => item.id === currentId);
  return items[(index + 1) % items.length];
}

export function eligibleProfiles(profiles: ProfileStat[], me: string | null | undefined, following: Set<string>) {
  return profiles.filter((p) => p.discoverable && !p.is_private && p.id !== me && !following.has(p.id));
}

export async function followThenAdvance(follow: () => Promise<unknown>, advance: () => void) {
  await follow();
  advance();
}
