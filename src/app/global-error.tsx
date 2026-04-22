"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
