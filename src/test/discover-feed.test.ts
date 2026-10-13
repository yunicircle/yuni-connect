import { describe, expect, it } from "vitest";
import { eligibleProfiles, followThenAdvance, nextSuggestion } from "@/lib/discover-feed";

describe("Discover photo suggestions", () => {
  it("cycles from the last suggestion back to the first", () => {
    expect(nextSuggestion([{ id: "one" }, { id: "two" }], "two")?.id).toBe("one");
  });
  it("advances to a different suggestion", () => {
    expect(nextSuggestion([{ id: "one" }, { id: "two" }], "one")?.id).toBe("two");
  });
  it("advances only after a successful follow", async () => {
    const order: string[] = [];
    await followThenAdvance(async () => { order.push("follow persisted"); }, () => { order.push("next photo"); });
    expect(order).toEqual(["follow persisted", "next photo"]);
  });
  it("keeps the current photo if following fails", async () => {
    let advances = 0;
    await expect(followThenAdvance(async () => { throw new Error("denied"); }, () => { advances++; })).rejects.toThrow("denied");
    expect(advances).toBe(0);
  });
  it("does not suggest hidden profiles, yourself or already followed users", () => {
    const base = { username: "member", display_name: "Member", bio: "", followers: 0, following: 0 };
    const profiles = [ { ...base, id: "hidden", discoverable: false }, { ...base, id: "self", discoverable: true }, { ...base, id: "followed", discoverable: true }, { ...base, id: "eligible", discoverable: true } ];
    expect(eligibleProfiles(profiles, "self", new Set(["followed"])).map((p) => p.id)).toEqual(["eligible"]);
  });
});
