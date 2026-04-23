export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-8 py-6 shadow-xl shadow-cyan-950/20">
        <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Pure Advance ERP
          </p>
          <p className="mt-2 text-sm text-slate-300">Loading module...</p>
        </div>
      </div>
    </div>
  );
}
