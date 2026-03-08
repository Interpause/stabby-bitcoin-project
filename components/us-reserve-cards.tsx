import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Landmark, Activity, CircleDollarSign } from "lucide-react"

export function UsReserveCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-200/50 dark:border-blue-900/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Landmark className="w-24 h-24" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-slate-400">U.S. Fed Goal</CardTitle>
          <Landmark className="h-3.3 w-3.5 text-blue-400" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-slate-50 tabular-nums">1M <span className="text-amber-500 text-sm">₿</span></div>
          <p className="text-[10px] text-muted-foreground font-medium">
            Strategic Target
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-slate-800 bg-slate-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-slate-400">Profit/Loss (YTD)</CardTitle>
          <CircleDollarSign className="h-3.5 w-3.5 text-emerald-400" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold tabular-nums text-emerald-400">+$18.2B</div>
          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <ArrowUpRight className="h-2.5 w-2.5 text-emerald-500" />
            <span>Unrealized Gains</span>
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-800 bg-slate-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-slate-400">State Adoption</CardTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://flagcdn.com/w40/us.png" alt="US Flag" className="h-2.5 rounded-xs opacity-70" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold tabular-nums text-white">14 <span className="text-xs font-medium text-muted-foreground">/ 50</span></div>
          <p className="text-[10px] text-muted-foreground font-medium">
            Treasury mandates
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-800 bg-slate-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-slate-400">Hashrate Share</CardTitle>
          <Activity className="h-3.5 w-3.5 text-amber-500" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold tabular-nums text-slate-100">38.4%</div>
          <p className="text-[10px] text-muted-foreground font-medium">
            Global Network Share
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
