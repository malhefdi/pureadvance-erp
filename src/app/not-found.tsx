import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/factory", label: "Factory Floor" },
  { href: "/process", label: "Process Flow" },
  { href: "/batches", label: "Batch Tracking" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-cyan-950/20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Pure Advance ERP
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
          That route is not part of the current demo build. Jump back to the command center or open one of the main showcase modules below.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
