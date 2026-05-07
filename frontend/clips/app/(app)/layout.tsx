import type { ReactNode } from "react";
import { AppLayout } from "@/components/AppLayout";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
