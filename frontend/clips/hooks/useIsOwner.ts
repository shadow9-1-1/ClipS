"use client";

import { useAuth } from "@/hooks/useAuth";
import { isResourceOwner } from "@/lib/ownership";

/** Convenience hook: owner check against `ownerId` from the API. */
export function useIsOwner(ownerId: string | null | undefined): boolean {
  const { user, loading } = useAuth();
  return isResourceOwner(user, loading, ownerId);
}
