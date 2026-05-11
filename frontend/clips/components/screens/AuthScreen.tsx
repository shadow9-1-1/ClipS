"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Sparkles, UserRound } from "lucide-react";
import { AuthService } from "@/lib/auth-service";
import { toast } from "sonner";

type AuthScreenProps = {
  mode: "login" | "signup";
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (mode === "signup" && !username) {
      setError("Username is required");
      return;
    }

    setBusy(true);

    try {
      let token: string;

      if (mode === "login") {
        const response = await AuthService.login(email, password);
        token = response.token;
        toast.success("Logged in successfully");
      } else {
        const response = await AuthService.register(username, email, password);
        token = response.token;
        toast.success("Account created successfully");
      }

      // Save token
      AuthService.saveToken(token);

      // Redirect based on role in token (admin -> /admin)
      const parsed = AuthService.parseToken(token);
      const redirect = parsed?.role === "admin" ? "/admin" : "/";
      window.location.assign(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid min-h-[calc(100vh-2rem)] gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass flex flex-col justify-between rounded-[2.5rem] p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            ClipS
          </div>
          <div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight">A cleaner short-video space for clips, loops, and collections.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Sign in to browse the feed, post clips, and explore profiles. Your data is stored in our database.
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["Feed", "Snap-scroll clips with full-screen playback"],
            ["Profiles", "Liked, saved, and posted videos in one place"],
            ["Database", "Your data is stored and synced with our backend"],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[2rem] border border-border bg-white/5 p-4">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-[2.5rem] p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{mode}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {mode === "signup" ? (
            <label className="block space-y-2 text-sm font-medium">
              <span>Username</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  type="text"
                  placeholder="your_username"
                  className="h-12 w-full rounded-full border border-border bg-background/80 pl-11 pr-4 outline-none"
                  disabled={busy}
                />
              </div>
            </label>
          ) : null}
          <label className="block space-y-2 text-sm font-medium">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@example.com"
              className="h-12 w-full rounded-full border border-border bg-background/80 px-4 outline-none"
              disabled={busy}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Password</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="••••••••"
                className="h-12 w-full rounded-full border border-border bg-background/80 pl-11 pr-4 outline-none"
                disabled={busy}
              />
            </div>
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <a href="/auth/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a href="/auth/login" className="font-medium text-primary hover:underline">
                  Sign in
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
