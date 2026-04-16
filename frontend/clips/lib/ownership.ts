import type { User } from "@/context/AuthContext";

/**
 * True when the logged-in user owns the resource.
 * While auth is loading, or when user/ownerId is missing → false (no flicker of owner UI).
 */
export function isResourceOwner(
  user: User | null,
  authLoading: boolean,
  ownerId: string | null | undefined
): boolean {
  if (authLoading) return false;
  if (!user?.id || !ownerId) return false;
  return user.id === ownerId;
}
