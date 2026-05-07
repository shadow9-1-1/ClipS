"use client";

import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, useMyProfile } from "@/lib/store";

export function EditProfileScreen() {
  const profile = useMyProfile();
  const updateProfile = useAppStore((state) => state.updateProfile);
  const setError = useAppStore((state) => state.setError);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setAvatarPreview(profile.avatar);
  }, [profile]);

  const submit = () => {
    setSaving(true);
    window.setTimeout(() => {
      if (Math.random() < 0.1) {
        setSaving(false);
        setError({ title: "Profile update failed", message: "The mock save request hit a simulated network error." });
        return;
      }

      updateProfile({ displayName, username, bio, avatar: avatarPreview });
      setSaving(false);
      toast.success("Profile updated");
    }, 850);
  };

  return (
    <section className="glass rounded-[2.5rem] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Save className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Edit profile</p>
          <h1 className="text-3xl font-semibold tracking-tight">Update your public identity.</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2.5rem] border border-border bg-black">
            <img src={avatarPreview} alt={displayName} className="h-80 w-full object-cover" />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10">
            <Camera className="h-4 w-4" />
            Upload avatar
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (!nextFile) return;
                const nextUrl = URL.createObjectURL(nextFile);
                setAvatarPreview(nextUrl);
              }}
            />
          </label>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">
            <span>Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="h-12 w-full rounded-full border border-border bg-background/80 px-4 outline-none" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value.replace(/\s+/g, "").toLowerCase())} className="h-12 w-full rounded-full border border-border bg-background/80 px-4 outline-none" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Bio</span>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={6} className="w-full rounded-3xl border border-border bg-background/80 px-4 py-3 outline-none" />
          </label>
          <button type="button" onClick={submit} disabled={saving} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
