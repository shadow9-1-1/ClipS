import type { Metadata } from "next";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

type PageProps = {
  params: {
    username: string;
  };
};

export function generateMetadata({ params }: PageProps): Metadata {
  const profileRef = params.username?.trim().replace(/^@/, "");
  return {
    title: `${profileRef} | ClipS`,
    description: `View ${profileRef}'s ClipS profile and videos.`,
  };
}

export default function ProfileByUsernamePage({ params }: PageProps) {
  return <ProfileScreen username={params.username} />;
}
