import type { Metadata } from "next";
import { AuthScreen } from "@/components/screens/AuthScreen";

export const metadata: Metadata = {
  title: "Sign up | ClipS",
  description: "Create a new ClipS account.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthScreen mode="signup" />
    </div>
  );
}
