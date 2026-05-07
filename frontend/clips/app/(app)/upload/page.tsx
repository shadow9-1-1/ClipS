import type { Metadata } from "next";
import { UploadScreen } from "@/components/screens/UploadScreen";

export const metadata: Metadata = {
  title: "Upload to ClipS",
  description: "Create a mock clip, preview it locally, and publish to your profile.",
};

export default function UploadPage() {
  return <UploadScreen />;
}
