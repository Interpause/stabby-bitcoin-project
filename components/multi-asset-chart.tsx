"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useBitcoinMarketChart,
  useFmpHistoricalPrice,
  useFmpTreasuryRates,
  TimeRange,
} from "@/lib/api/market-data";
import { Loader2 } from "lucide-react";

export function MultiAssetChart() {
  const [range, setRange] = useState<TimeRange>("1m");

  const { data: btcData, isLoading: btcLoading } = useBitcoinMarketChart(range);
  const { data: sp500Data, isLoading: spLoading } = useFmpHistoricalPrice("^GSPC", range);
  const { data: goldData, isLoading: goldLoading } = useFmpHistoricalPrice("GCUSD", range);
  const { data: treasuryData, isLoading: tLoading } = useFmpTreasuryRates(range);

  const isLoading = btcLoading || spLoading || goldLoading || tLoading;

  const { chartData, btcBase } = useMemo(() => {
    if (!btcData && !sp500Data && !goldData && !treasuryData) return { chartData: [], btcBase: 0 };

    const dateMap: Record<string, Record<string, number | string>> = {};

    // Helper to add data to map
    const addData = (date: string, key: string, value: number) => {
      if (!dateMap[date]) dateMap[date] = { date };
      dateMap[date][key] = value;
    };

    // BTC
    if (Array.isArray(btcData)) {
      btcData.forEach((point: number[]) => {
        if (point.length >= 2) {
          const timestamp = point[0];
          const price = point[1];
          const date = new Date(timestamp).toISOString().split("T")[0];
          addData(date, "btc", price);
        }
      });
    }

    // SP500
    if (Array.isArray(sp500Data)) {
      sp500Data.forEach((d: { date?: string; close?: number }) => {
        if (d.date && typeof d.close === 'number') addData(d.date, "sp500", d.close);
      });
    }

    // Gold
    if (Array.isArray(goldData)) {
      goldData.forEach((d: { date?: string; close?: number }) => {
        if (d.date && typeof d.close === 'number') addData(d.date, "gold", d.close);
      });
    }

    // Treasuries
    if (Array.isArray(treasuryData)) {
      treasuryData.forEach((d: { date?: string; year5?: number; year10?: number }) => {
        if (d.date) {
          if (typeof d.year5 === 'number') addData(d.date, "treasury5y", d.year5);
          if (typeof d.year10 === 'number') addData(d.date, "treasury10y", d.year10);
        }
      });
    }

    // Convert map to array and sort by date ascending
    const sortedVals = Object.values(dateMap).sort((a, b) => (a.date as string).localeCompare(b.date as string));

    if (sortedVals.length === 0) return { chartData: [], btcBase: 0 };

    // Base values for % change
    const bases: Record<string, number> = {};
    const keys = ["btc", "sp500", "gold", "treasury5y", "treasury10y"];

    const data = sortedVals.map((item) => {
      const point: Record<string, string | number> = { date: item.date as string };
      keys.forEach((k) => {
        const val = item[k];
        if (typeof val === 'number') {
          point[`${k}Raw`] = val;
          if (bases[k] === undefined) {
            bases[k] = val; // first seen value
            point[k] = 0;
          } else {
            point[k] = ((val - bases[k]) / bases[k]) * 100;
          }
        }
      });
      return point;
    });

    return { chartData: data, btcBase: bases["btc"] || 0 };

  }, [btcData, sp500Data, goldData, treasuryData]);

  const formatCompactUSD = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500/80">
          Relative Performance
        </h2>
        <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1 gap-1">
          {(["1m", "6m", "1y"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-amber-500/20 text-amber-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-[200px] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={12} 
              tickFormatter={(val) => {
                const d = new Date(val);
                // Simple MM/DD formatting
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              minTickGap={20}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              width={75}
              tick={{ fill: "#ffffff" }}
              tickFormatter={(val) => {
                const percentStr = `${val > 0 ? '+' : ''}${val.toFixed(0)}%`;
                if (btcBase > 0) {
                  const btcValStr = formatCompactUSD(btcBase * (1 + val / 100));
                  return `${percentStr} (${btcValStr})`;
                }
                return percentStr;
              }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}
              formatter={(value: number, name: string, item: { payload?: Record<string, number | string> }) => {
                const percentStr = `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
                
                let rawKey = '';
                if (name === 'Bitcoin') rawKey = 'btcRaw';
                else if (name === 'Gold') rawKey = 'goldRaw';
                else if (name === 'S&P 500') rawKey = 'sp500Raw';
                else if (name === '10Y Treasury') rawKey = 'treasury10yRaw';
                else if (name === '5Y Treasury') rawKey = 'treasury5yRaw';

                const rawVal = item.payload?.[rawKey];
                
                if (rawVal !== undefined && typeof rawVal === 'number') {
                  if (name.includes('Treasury')) {
                    return [`${percentStr} (${rawVal.toFixed(2)}%)`, name];
                  } else {
                    const rawStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rawVal);
                    return [`${percentStr} (${rawStr})`, name];
                  }
                }
                return [percentStr, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line type="linear" animationDuration={300} name="Bitcoin" dataKey="btc" stroke="#ffffff" strokeWidth={2} dot={false} connectNulls activeDot={{ r: 6 }} />
            <Line type="linear" animationDuration={300} name="Gold" dataKey="gold" stroke="#fbbf24" strokeWidth={2} dot={false} connectNulls />
            <Line type="linear" animationDuration={300} name="S&P 500" dataKey="sp500" stroke="#0ea5e9" strokeWidth={2} dot={false} connectNulls />
            <Line type="linear" animationDuration={300} name="10Y Treasury" dataKey="treasury10y" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
            <Line type="linear" animationDuration={300} name="5Y Treasury" dataKey="treasury5y" stroke="#8b5cf6" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
