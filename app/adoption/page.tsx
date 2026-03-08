import { GlobalAdoptionMap } from "@/components/global-adoption-map";
import { AdoptionLeaderboard } from "@/components/adoption-leaderboard";
import { UsReserveCards } from "@/components/us-reserve-cards";

export default function AdoptionDashboardRoute() {
  return (
    <div className="flex flex-col flex-1 bg-slate-950 overflow-x-hidden">
      {/* First Page Viewport - Fixed Height to fit all essentials */}
      <div className="h-[calc(100vh-4rem)] p-6 gap-4 flex flex-col container mx-auto overflow-hidden">
        <div className="shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">Global Adoption & Leaderboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time tracker of nation-state and central bank Bitcoin adoption.
          </p>
        </div>

        <section className="flex-1 min-h-0 relative bg-slate-900/40 rounded-xl border border-slate-800/50 overflow-hidden">
          <GlobalAdoptionMap />
        </section>
        
        <section className="shrink-0 space-y-3 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500/80">U.S. Strategic Reserve Anniversary</h2>
          <UsReserveCards />
        </section>
      </div>

      {/* Second Page Viewport (Leaderboard) */}
      <div className="min-h-[calc(100vh-4rem)] bg-slate-900/20 border-t border-border/40">
        <div className="container mx-auto p-6 space-y-6 pt-12">
          <h2 className="text-2xl font-bold tracking-tight">Adoption Leaderboard</h2>
          <AdoptionLeaderboard />
        </div>
      </div>
    </div>
  );
}
