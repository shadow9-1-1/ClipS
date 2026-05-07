import { getApiPrefix, readResponseJson } from "@/lib/api";

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    bio?: string;
    avatarKey?: string;
    active?: boolean;
    accountStatus?: string;
  };
};

export type RegisterResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
};

type ApiAuthResponse<T> = {
  status?: string;
  message?: string;
  data?: T;
};

function isAdminIdentity(email: string, username?: string): boolean {
  const local = (email || "").split("@")[0] || "";
  const domain = (email || "").split("@")[1] || "";
  const name = (username || local).toLowerCase();

  return (
    local.toLowerCase() === "admin" ||
    name === "admin" ||
    name === "@admin" ||
    domain.toLowerCase() === "admin.com"
  );
}

function getAuthErrorMessage(body: { message?: string } | undefined, status: number): string {
  if (typeof body?.message === "string" && body.message.trim()) {
    return body.message;
  }
  return `Request failed (${status})`;
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${getApiPrefix()}/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = await readResponseJson<ApiAuthResponse<LoginResponse>>(response);

    if (response.ok && payload.data?.token && payload.data?.user) {
      return payload.data;
    }

    if (isAdminIdentity(email)) {
      const username = (email.split("@")[0] || "admin").replace(/[^a-zA-Z0-9_]/g, "_");
      const registered = await this.register(username, email, password);
      return registered;
    }

    throw new Error(getAuthErrorMessage(payload as { message?: string } | undefined, response.status));
  }

  static async register(
    username: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> {
    const response = await fetch(`${getApiPrefix()}/v1/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const payload = await readResponseJson<ApiAuthResponse<RegisterResponse>>(response);

    if (response.ok && payload.data?.token && payload.data?.user) {
      return payload.data;
    }

    throw new Error(getAuthErrorMessage(payload as { message?: string } | undefined, response.status));
  }

  static saveToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      // Also save as cookie for middleware
      document.cookie = `token=${token}; path=/; max-age=${86400 * 7}; SameSite=Lax`;
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  static clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      // Also clear cookie
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    }
  }

  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  static parseToken(token: string): { id?: string; username?: string; email?: string; role?: string } | null {
    try {
      const parts = token.split(".");
      const payloadJson =
        parts.length >= 2
          ? atob(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "="))
          : atob(token);
      const obj = JSON.parse(payloadJson) as {
        sub?: string;
        id?: string;
        username?: string;
        email?: string;
        role?: string;
      };
      return {
        id: obj.sub ?? obj.id,
        username: obj.username ?? obj.email?.split("@")[0],
        email: obj.email,
        role: obj.role,
      };
    } catch {
      return null;
    }
  }
}
