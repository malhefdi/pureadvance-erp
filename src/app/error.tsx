"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-cyan-950/20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Pure Advance ERP
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Failed to load this page
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Something went sideways while rendering this module. You can retry immediately or head back to the command center.
        </p>
        <p className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-400">
          {error.message}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
