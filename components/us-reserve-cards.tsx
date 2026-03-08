import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Landmark, Activity, CircleDollarSign } from "lucide-react"

export function UsReserveCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-200/50 dark:border-blue-900/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Landmark className="w-24 h-24" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">U.S. Federal Reserve Goal</CardTitle>
          <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">1,000,000 <span className="text-amber-500">₿</span></div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Strategic National Reserve Target
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Accumulated 1-Year</CardTitle>
          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">+204,500 <span className="text-amber-500">₿</span></div>
          <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
            <span>Since Reserve Anniversary</span>
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total States Adopting</CardTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://flagcdn.com/w40/us.png" alt="US Flag" className="h-3 rounded-sm opacity-80 blur-[0.5px]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">14 <span className="text-sm font-medium text-muted-foreground">/ 50</span></div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            States with Treasury mandates
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Estimated PnL (YTD)</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">+$18.2B</div>
          <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
            <span>Unrealized public treasury gains</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
