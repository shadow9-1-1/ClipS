import { UploadForm } from "@/app/upload/UploadForm";

export default function UploadPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 py-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Upload
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Add a public MP4 clip. Processing runs on the API (duration check, MinIO storage).
      </p>
      <div className="mt-8">
        <UploadForm />
      </div>
    </main>
  );
}
