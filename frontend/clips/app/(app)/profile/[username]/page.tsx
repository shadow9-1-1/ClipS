import type { Metadata } from "next";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

type PageProps = {
  params: {
    username: string;
  };
};

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `@${params.username} | ClipS`,
    description: `View @${params.username}'s ClipS profile and videos.`,
  };
}

export default function ProfileByUsernamePage({ params }: PageProps) {
  return <ProfileScreen username={params.username} />;
}
