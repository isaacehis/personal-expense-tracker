import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <section className="max-w-lg text-center">
        <p className="text-sm font-black uppercase tracking-[.35em] text-emerald-400">404 · Page not found</p>
        <h1 className="mt-5 text-5xl font-black tracking-tight">This page is off the books.</h1>
        <p className="mt-5 leading-7 text-slate-300">The address may be incorrect, or the page may have moved. Use one of the safe routes below.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/" className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300">Go home</Link><Link href="/dashboard" className="rounded-xl border border-slate-700 px-5 py-3 font-bold hover:border-emerald-400">Open dashboard</Link></div>
      </section>
    </main>
  );
}
