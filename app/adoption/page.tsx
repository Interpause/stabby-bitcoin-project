import { GlobalAdoptionMap } from "@/components/global-adoption-map";
import { AdoptionLeaderboard } from "@/components/adoption-leaderboard";
import { UsReserveCards } from "@/components/us-reserve-cards";

export default function AdoptionDashboardRoute() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Adoption & Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time tracker of nation-state and central bank Bitcoin adoption statuses globally.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Sovereign Map</h2>
        <GlobalAdoptionMap />
      </section>
      
      <section className="space-y-4 pt-4 border-t">
        <h2 className="text-xl font-semibold tracking-tight">U.S. Strategic Reserve Anniversary</h2>
        <UsReserveCards />
      </section>
      
      {/* We will implement the Leaderboard here next */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Adoption Leaderboard</h2>
        <AdoptionLeaderboard />
      </section>
    </div>
  );
}
