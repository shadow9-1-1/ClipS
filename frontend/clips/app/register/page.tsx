"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Spinner } from "@/components/ui/Spinner";
import {
  getApiPrefix,
  getFetchErrorMessage,
  readResponseJson,
} from "@/lib/api";
import {
  isValidEmail,
  validatePassword,
  validateUsername,
} from "@/lib/auth-validation";

type RegisterResponse = {
  status?: string;
  message?: string;
  data?: unknown;
};

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
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
    const uErr = validateUsername(username);
    if (uErr) nextField.username = uErr;
    if (!email.trim()) nextField.email = "Email is required";
    else if (!isValidEmail(email)) nextField.email = "Enter a valid email address";
    const pErr = validatePassword(password);
    if (pErr) nextField.password = pErr;

    if (Object.keys(nextField).length > 0) {
      setFieldErrors(nextField);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiPrefix()}/v1/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await readResponseJson<RegisterResponse>(res);

      if (!res.ok) {
        setError(
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : `Request failed (${res.status})`
        );
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(getFetchErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Join ClipSphere with a username and email."
      footer={
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Sign in
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
            htmlFor="register-username"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Username
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
            placeholder="clip_fan"
            disabled={loading}
          />
          {fieldErrors.username ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {fieldErrors.username}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Email
          </label>
          <input
            id="register-email"
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
            htmlFor="register-password"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
            placeholder="At least 8 characters"
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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
