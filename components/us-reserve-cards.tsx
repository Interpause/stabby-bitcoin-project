"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Landmark, Briefcase, Bitcoin, Globe, Loader2 } from "lucide-react"
import { useGlobalStats } from "@/lib/api/adoption"

function formatNumber(num: number, isCurrency = true) {
  if (num === 0) return '—';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: isCurrency ? 'currency' : 'decimal',
    currency: 'USD',
    maximumFractionDigits: 1,
    notation: 'compact',
    compactDisplay: 'short'
  });
  return formatter.format(num);
}

export function UsReserveCards() {
  const { totalHeldByGov, totalGovReserves, currentPrice, marketCap, isLoading } = useGlobalStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-200/50 dark:border-blue-900/50 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-slate-400">Held by Governments</CardTitle>
          <Landmark className="h-3.5 w-3.5 text-blue-400" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" /> : (
            <>
              <div className="text-xl font-bold text-slate-50 tabular-nums">{formatNumber(totalHeldByGov)}</div>
              <p className="text-[10px] text-muted-foreground font-medium">
                Global sovereign holdings
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-slate-800 bg-slate-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-emerald-400/80">Total Gov. Reserves</CardTitle>
          <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" /> : (
            <>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">{formatNumber(totalGovReserves)}</div>
              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                Global FX reserves
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-800 bg-slate-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-amber-500/80">Current Price</CardTitle>
          <Bitcoin className="h-3.5 w-3.5 text-amber-500" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" /> : (
            <>
              <div className="text-xl font-bold tabular-nums text-amber-500">
                <span className="text-amber-500/60 text-lg mr-1">$</span>
                {currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                USD / BTC
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-800 bg-slate-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-slate-400">Bitcoin Market Cap</CardTitle>
          <Globe className="h-3.5 w-3.5 text-blue-400" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" /> : (
            <>
              <div className="text-xl font-bold tabular-nums text-slate-100">{formatNumber(marketCap)}</div>
              <p className="text-[10px] text-muted-foreground font-medium">
                Global supply value
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
