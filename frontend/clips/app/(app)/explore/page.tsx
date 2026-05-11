import type { Metadata } from "next";
import { ExploreScreen } from "@/components/screens/ExploreScreen";

export const metadata: Metadata = {
  title: "Explore ClipS",
  description: "Search creators, captions, music, and tags in ClipS.",
};

export default function ExplorePage() {
  return <ExploreScreen />;
}
