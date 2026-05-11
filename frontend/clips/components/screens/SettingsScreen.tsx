"use client";

import { LogOut, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { AuthService } from "@/lib/auth-service";

const languages = ["English", "Spanish", "French", "Japanese"];

export function SettingsScreen() {
  const router = useRouter();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const toggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      updateSettings({ [key]: !settings[key] } as Partial<typeof settings>);
    }
  };

  const handleLogout = () => {
    AuthService.clearToken();
    router.push("/auth/login");
  };

  return (
    <section className="glass rounded-[2.5rem] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Settings</p>
          <h1 className="text-3xl font-semibold tracking-tight">Personalize how ClipS behaves.</h1>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Row label="Auto-scroll" description="Move to the next clip automatically while browsing the feed.">
          <Switch checked={settings.autoScroll} onCheckedChange={() => toggle("autoScroll")} />
        </Row>
        <Row label="Notifications" description="Receive alerts for likes, follows, and comments.">
          <Switch checked={settings.notifications} onCheckedChange={() => toggle("notifications")} />
        </Row>
        <Row label="Private account" description="Hide your profile from people who do not follow you.">
          <Switch checked={settings.privateAccount} onCheckedChange={() => toggle("privateAccount")} />
        </Row>
        <Row label="Reduce data usage" description="Prefer lighter previews and fewer auto-loaded assets.">
          <Switch checked={settings.reduceData} onCheckedChange={() => toggle("reduceData")} />
        </Row>

        <div className="flex flex-col gap-3 rounded-[2rem] border border-border bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Language</p>
            <p className="text-sm text-muted-foreground">Controls labels and copy in the interface.</p>
          </div>
          <select
            value={settings.language}
            onChange={(event) => updateSettings({ language: event.target.value })}
            aria-label="Language"
            className="h-11 rounded-full border border-border bg-background/80 px-4 text-sm outline-none"
          >
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-white/5 px-5 text-sm font-semibold text-foreground transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-border bg-white/5 p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
