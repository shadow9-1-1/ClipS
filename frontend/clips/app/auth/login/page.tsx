import type { Metadata } from "next";
import { AuthScreen } from "@/components/screens/AuthScreen";

export const metadata: Metadata = {
  title: "Log in | ClipS",
  description: "Sign in to ClipS.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthScreen mode="login" />
    </div>
  );
}
