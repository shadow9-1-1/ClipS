import type { Metadata } from "next";
import { EditProfileScreen } from "@/components/screens/EditProfileScreen";

export const metadata: Metadata = {
  title: "Edit Profile | ClipS",
  description: "Update your display name, username, avatar, and bio in ClipS.",
};

export default function EditProfilePage() {
  return <EditProfileScreen />;
}
