export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Not found</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This page doesn’t exist.
        </p>
      </div>
    </div>
  );
}


