export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
