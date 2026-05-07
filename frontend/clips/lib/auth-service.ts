const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "http://localhost:5000/api";

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

// Mock authentication - doesn't validate against backend
const mockUsers: Record<string, { username: string; email: string; password: string }> = {};

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    // For development: accept any email/password combination
    const user = mockUsers[email] || { username: email.split("@")[0], email, password };
    
    // Create a mock token (JWT-like format)
    const mockToken = btoa(
      JSON.stringify({
        id: `user_${Date.now()}`,
        email,
        username: user.username,
        role: "user",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );

    return {
      token: mockToken,
      user: {
        id: `user_${Date.now()}`,
        username: user.username,
        email,
        role: "user",
      },
    };
  }

  static async register(
    username: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> {
    // For development: accept any registration
    mockUsers[email] = { username, email, password };

    // Create a mock token
    const mockToken = btoa(
      JSON.stringify({
        id: `user_${Date.now()}`,
        email,
        username,
        role: "user",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );

    return {
      token: mockToken,
      user: {
        id: `user_${Date.now()}`,
        username,
        email,
        role: "user",
      },
    };
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
}
