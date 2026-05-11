import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (withAuth) {
    Object.assign(headers, getBearerAuthHeader());
  }

  const res = await fetch(`${getApiPrefix()}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    const baseMessage = body?.message || "Request failed";
    const message = `${baseMessage} (${res.status})`;
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export async function fetchVideos(limit: number, skip: number) {
  return request<{ data?: { videos?: unknown[] }; total?: number }>(
    `/v1/videos?limit=${limit}&skip=${skip}`
  );
}

export async function fetchFollowingFeed(limit: number, skip: number) {
  return request<{ data?: { videos?: unknown[] }; total?: number }>(
    `/v1/videos/feed/following?limit=${limit}&skip=${skip}`,
    {},
    true
  );
}

export async function fetchTrendingFeed(limit: number, skip: number) {
  return request<{ data?: { videos?: unknown[] }; total?: number }>(
    `/v1/videos/feed/trending?limit=${limit}&skip=${skip}`
  );
}

export async function fetchUserById(id: string) {
  return request<{ data?: { user?: unknown } }>(`/v1/users/${id}`);
}

export async function fetchUserByUsername(username: string) {
  return request<{ data?: { user?: unknown } }>(
    `/v1/users/username/${encodeURIComponent(username)}`
  );
}

export async function fetchFollowers(userId: string) {
  return request<{ data?: { followers?: unknown[] } }>(
    `/v1/users/${userId}/followers`
  );
}

export async function fetchFollowing(userId: string) {
  return request<{ data?: { following?: unknown[] } }>(
    `/v1/users/${userId}/following`
  );
}

export async function createPresignedUrl(key: string, bucket?: string) {
  return request<{ data?: { accessUrl?: string } }>(
    `/v1/storage/presigned-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, ...(bucket ? { bucket } : {}) }),
    },
    true
  );
}
