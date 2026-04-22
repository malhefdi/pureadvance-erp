"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold text-red-400 mb-3">
        Failed to load this page
      </h2>
      <p className="text-gray-400 text-sm mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
