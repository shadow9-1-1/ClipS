import type { Metadata } from "next";
import { SettingsScreen } from "@/components/screens/SettingsScreen";

export const metadata: Metadata = {
  title: "Settings | ClipS",
  description: "Adjust feed behavior, privacy, language, and account state in ClipS.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
