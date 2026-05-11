import type { Metadata } from "next";
import { UploadScreen } from "@/components/screens/UploadScreen";

export const metadata: Metadata = {
  title: "Upload to ClipS",
  description: "Upload a clip, preview it locally, and publish to your profile.",
};

export default function UploadPage() {
  return <UploadScreen />;
}
