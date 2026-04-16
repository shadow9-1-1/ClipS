"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import {
  getApiPrefix,
  getFetchErrorMessage,
  readResponseJson,
} from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import {
  validateUsername,
} from "@/lib/auth-validation";

type EmailPrefs = {
  followers: boolean;
  newVideos: boolean;
  comments: boolean;
  likes: boolean;
  tips: boolean;
};

const DEFAULT_PREFS: EmailPrefs = {
  followers: true,
  newVideos: true,
  comments: true,
  likes: true,
  tips: true,
};

function parseEmailPrefs(raw: unknown): EmailPrefs {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_PREFS };
  }
  const o = raw as Record<string, unknown>;
  return {
    followers: typeof o.followers === "boolean" ? o.followers : DEFAULT_PREFS.followers,
    newVideos: typeof o.newVideos === "boolean" ? o.newVideos : DEFAULT_PREFS.newVideos,
    comments: typeof o.comments === "boolean" ? o.comments : DEFAULT_PREFS.comments,
    likes: typeof o.likes === "boolean" ? o.likes : DEFAULT_PREFS.likes,
    tips: typeof o.tips === "boolean" ? o.tips : DEFAULT_PREFS.tips,
  };
}

export function SettingsForm() {
  const router = useRouter();
  const { user, loading: authLoading, refetch } = useAuth();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [emailPrefs, setEmailPrefs] = useState<EmailPrefs>({ ...DEFAULT_PREFS });
  const [inAppPrefs, setInAppPrefs] = useState<EmailPrefs>({ ...DEFAULT_PREFS });

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileOk, setProfileOk] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [prefError, setPrefError] = useState<string | null>(null);
  const [prefOk, setPrefOk] = useState<string | null>(null);
  const [prefSaving, setPrefSaving] = useState(false);

  const hydrate = useCallback(() => {
    if (!user) return;
    setUsername(user.username ?? "");
    setBio(typeof user.bio === "string" ? user.bio : "");
    const np = user.notificationPreferences as
      | { email?: unknown; inApp?: unknown }
      | undefined;
    setEmailPrefs(parseEmailPrefs(np?.email));
    setInAppPrefs(parseEmailPrefs(np?.inApp));
  }, [user]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?callbackUrl=/settings");
    }
  }, [authLoading, user, router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileOk(null);

    const uErr = validateUsername(username);
    if (uErr) {
      setProfileError(uErr);
      return;
    }
    if (bio.length > 500) {
      setProfileError("Bio cannot exceed 500 characters.");
      return;
    }

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      setProfileError("You must be signed in.");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch(`${getApiPrefix()}/v1/users/updateMe`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...auth,
        },
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await readResponseJson<{ message?: string }>(res);
      if (!res.ok) {
        setProfileError(
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : `Update failed (${res.status})`
        );
        return;
      }

      setProfileOk("Profile saved.");
      await refetch();
    } catch (err) {
      setProfileError(getFetchErrorMessage(err));
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    setPrefError(null);
    setPrefOk(null);

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      setPrefError("You must be signed in.");
      return;
    }

    setPrefSaving(true);
    try {
      const res = await fetch(`${getApiPrefix()}/v1/users/preferences`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...auth,
        },
        body: JSON.stringify({
          email: emailPrefs,
          inApp: inAppPrefs,
        }),
      });

      const data = await readResponseJson<{ message?: string }>(res);
      if (!res.ok) {
        setPrefError(
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : `Update failed (${res.status})`
        );
        return;
      }

      setPrefOk("Notification settings saved.");
      await refetch();
    } catch (err) {
      setPrefError(getFetchErrorMessage(err));
    } finally {
      setPrefSaving(false);
    }
  }

  function toggleEmail(key: keyof EmailPrefs) {
    setEmailPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function toggleInApp(key: keyof EmailPrefs) {
    setInAppPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading settings" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const prefRows: { key: keyof EmailPrefs; label: string }[] = [
    { key: "followers", label: "New followers" },
    { key: "newVideos", label: "New videos from people you follow" },
    { key: "comments", label: "Comments on your videos" },
    { key: "likes", label: "Likes on your videos" },
    { key: "tips", label: "Tips" },
  ];

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50";

  return (
    <div className="mx-auto w-full max-w-lg space-y-10">
      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Profile
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Update your public username and bio.
          </p>
        </div>

        {profileError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {profileError}
          </div>
        ) : null}
        {profileOk ? (
          <p
            role="status"
            className="text-sm text-emerald-700 dark:text-emerald-400"
          >
            {profileOk}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <label
            htmlFor="settings-username"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Username
          </label>
          <input
            id="settings-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            disabled={profileSaving}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="settings-bio"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Bio
          </label>
          <textarea
            id="settings-bio"
            name="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about you…"
            maxLength={500}
            className={`${inputClass} resize-y min-h-[96px]`}
            disabled={profileSaving}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {bio.length}/500
          </p>
        </div>

        <button
          type="submit"
          disabled={profileSaving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {profileSaving ? (
            <>
              <Spinner size="sm" />
              Saving…
            </>
          ) : (
            "Save profile"
          )}
        </button>
      </form>

      <form
        onSubmit={savePreferences}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Control in-app and email alerts. Engagement emails still respect these
            toggles on the server.
          </p>
        </div>

        {prefError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {prefError}
          </div>
        ) : null}
        {prefOk ? (
          <p
            role="status"
            className="text-sm text-emerald-700 dark:text-emerald-400"
          >
            {prefOk}
          </p>
        ) : null}

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Email
          </legend>
          {prefRows.map(({ key, label }) => (
            <label
              key={`email-${key}`}
              className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={emailPrefs[key]}
                onChange={() => toggleEmail(key)}
                disabled={prefSaving}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
              />
              {label}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            In-app
          </legend>
          {prefRows.map(({ key, label }) => (
            <label
              key={`inapp-${key}`}
              className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={inAppPrefs[key]}
                onChange={() => toggleInApp(key)}
                disabled={prefSaving}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
              />
              {label}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={prefSaving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {prefSaving ? (
            <>
              <Spinner size="sm" />
              Saving…
            </>
          ) : (
            "Save notifications"
          )}
        </button>
      </form>
    </div>
  );
}
