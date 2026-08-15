export default function DashboardPage() {
  return (
    <section>
      <p className="font-semibold uppercase tracking-[0.3em] text-emerald-400">
        Dashboard
      </p>

      <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
        Your financial overview
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-slate-400">
        This protected page will display your income, expenses, balance,
        budgets, charts, and recent transactions.
      </p>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Transaction history
        </p>

        <h2 className="mt-3 text-2xl font-bold">
          No financial information displayed yet
        </h2>

        <p className="mt-3 max-w-2xl text-slate-400">
          In the next stage, we will connect this dashboard to real transaction
          queries from PostgreSQL. We will not use fake dashboard data.
        </p>
      </div>
    </section>
  );
}