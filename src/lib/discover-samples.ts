import creative from "@/assets/sample-creative.jpg";
import artist from "@/assets/sample-artist.jpg";
import maker from "@/assets/sample-maker.jpg";
import type { ProfileStat } from "./social";

export type DiscoveryPhoto = { id: string; url: string; profile: ProfileStat; sample?: boolean };
export const samplePhotos: DiscoveryPhoto[] = [
  { id: "sample-creative", url: creative, sample: true, profile: { id: "sample-creative", username: "river.creates", display_name: "River", bio: "Design, good music & little adventures.", discoverable: true, followers: 0, following: 0 } },
  { id: "sample-artist", url: artist, sample: true, profile: { id: "sample-artist", username: "imani.art", display_name: "Imani", bio: "Making space for art and connection.", discoverable: true, followers: 0, following: 0 } },
  { id: "sample-maker", url: maker, sample: true, profile: { id: "sample-maker", username: "kai.makes", display_name: "Kai", bio: "Always learning. Always creating.", discoverable: true, followers: 0, following: 0 } },
];
