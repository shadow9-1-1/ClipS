import type { Metadata } from "next";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

export const metadata: Metadata = {
  title: "Your Profile | ClipS",
  description: "Review your mock clip library, liked posts, and saved videos.",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
