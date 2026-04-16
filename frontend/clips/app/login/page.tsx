"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import {
  getApiPrefix,
  getFetchErrorMessage,
  readResponseJson,
} from "@/lib/api";
import { isValidEmail } from "@/lib/auth-validation";
import { setSessionTokenCookie } from "@/lib/session-cookie";

function safeCallbackPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

type LoginResponse = {
  status?: string;
  message?: string;
  data?: { token?: string };
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const nextField: typeof fieldErrors = {};
    if (!email.trim()) nextField.email = "Email is required";
    else if (!isValidEmail(email)) nextField.email = "Enter a valid email address";
    if (!password) nextField.password = "Password is required";
    if (Object.keys(nextField).length > 0) {
      setFieldErrors(nextField);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiPrefix()}/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await readResponseJson<LoginResponse>(res);

      if (!res.ok) {
        setError(
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : `Request failed (${res.status})`
        );
        return;
      }

      const token = data.data?.token;
      if (typeof token !== "string" || !token) {
        setError("Login succeeded but no token was returned.");
        return;
      }

      setSessionTokenCookie(token);
      await refetch();

      const dest = safeCallbackPath(searchParams.get("callbackUrl"));
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(getFetchErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to ClipSphere."
      footer={
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
        noValidate
      >
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {error}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
            placeholder="you@example.com"
            disabled={loading}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
            placeholder="••••••••"
            disabled={loading}
          />
          {fieldErrors.password ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

function LoginFallback() {
  return (
    <AuthShell title="Sign in" subtitle="Welcome back to ClipSphere.">
      <div className="flex justify-center rounded-xl border border-zinc-200 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-900/40">
        <Spinner size="lg" label="Loading sign-in" />
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
