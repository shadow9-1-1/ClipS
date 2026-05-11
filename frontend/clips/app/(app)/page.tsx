import type { Metadata } from "next";
import { HomeFeedScreen } from "@/components/screens/HomeFeedScreen";

export const metadata: Metadata = {
  title: "ClipS Feed",
  description: "Browse a full-screen feed of short videos on ClipS.",
};

export default function HomePage() {
  return <HomeFeedScreen />;
}
