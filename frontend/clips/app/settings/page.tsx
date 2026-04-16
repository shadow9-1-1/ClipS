import { SettingsForm } from "@/app/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 py-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Settings
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Manage your profile and notification preferences.
      </p>
      <div className="mt-8">
        <SettingsForm />
      </div>
    </main>
  );
}
