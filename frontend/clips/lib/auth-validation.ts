/** Aligns with backend `authSchemas` where applicable. */

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function validateUsername(value: string): string | null {
  const u = value.trim();
  if (!u) return "Username is required";
  if (u.length < MIN_USERNAME_LENGTH) {
    return `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
  }
  if (u.length > MAX_USERNAME_LENGTH) {
    return `Username cannot exceed ${MAX_USERNAME_LENGTH} characters`;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(u)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}
