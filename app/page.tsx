import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Bitcoin Global <span className="text-amber-500">Adoption</span> Dashboard
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Track nation-states, track macro correlations, and visualize sovereign shifts in real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          <Link href="/adoption" className="block p-6 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-shadow hover:border-amber-500/50">
            <h3 className="font-bold text-lg mb-2">Global Adoption</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Interactive choropleth map and ranking ladder of sovereign holdings and policy statuses.</p>
          </Link>

          <Link href="/macro" className="block p-6 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-shadow hover:border-amber-500/50">
            <h3 className="font-bold text-lg mb-2">Macro & Geopolitics</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">IMF tensions, sovereign debt correlation, and mining hashrate arms race overview.</p>
          </Link>

          <Link href="/portfolio" className="block p-6 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-shadow hover:border-amber-500/50">
            <h3 className="font-bold text-lg mb-2">Diversification</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Compare BTC alongside Gold and Equities through rolling correlation heatmaps.</p>
          </Link>
        </div>

        <div className="pt-8 flex justify-center">
          <Link href="/adoption" className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500 text-white rounded-full px-8 text-lg font-semibold h-14 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
            Enter Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
