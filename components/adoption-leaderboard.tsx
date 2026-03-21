'use client';

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  Column,
} from "@tanstack/react-table"
import { ArrowUpDown, Triangle } from "lucide-react"

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '🏳️';
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAdoptionLeaderboard } from "@/lib/api/adoption"
import { UiAdoptionLeaderboardItem } from "@/lib/types/ui-models"

const SortableHeader = ({ column, title, className = "" }: { column: Column<UiAdoptionLeaderboardItem, unknown>, title: string, className?: string }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className={`hover:bg-transparent px-0 font-semibold transition-colors ${className}`}
  >
    {title}
    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
  </Button>
);

export const columns: ColumnDef<UiAdoptionLeaderboardItem>[] = [
  {
    accessorKey: "name",
    header: "Country",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="text-xl leading-none">{getFlagEmoji(row.original.countryCode || '')}</div>
        <div className="font-medium text-slate-900 dark:text-slate-100">{row.getValue("name")}</div>
      </div>
    ),
  },
  {
    accessorFn: (row) => row.totalHoldingsBtc === 0 ? undefined : row.totalHoldingsBtc,
    id: "totalHoldingsBtc",
    header: ({ column }) => <SortableHeader column={column} title="Holdings" className="text-slate-900 dark:text-slate-100" />,
    cell: ({ row }) => <HoldingsCell row={row.original} />,
    sortUndefined: 'last',
  },
  {
    accessorFn: (row) => {
      if (row.totalHoldingsBtc === 0) return undefined;
      return (row.totalEntryValueUsd !== undefined && row.totalEntryValueUsd > 0) ? (row.totalEntryValueUsd / row.totalHoldingsBtc) : -1;
    },
    id: "entryPrice",
    header: ({ column }) => (
      <div className="text-right">
        <SortableHeader column={column} title="Entry Price" className="text-slate-900 dark:text-slate-100 justify-end w-full" />
      </div>
    ),
    cell: ({ row }) => <AvgPurchasePriceCell row={row.original} />,
    sortUndefined: 'last',
  },
  {
    accessorFn: (row) => (row.totalHoldingsBtc === 0 || row.reserveAllocationGdpPercent === 0) ? undefined : row.reserveAllocationGdpPercent,
    id: "reserveAllocationGdpPercent",
    header: ({ column }) => (
      <div className="text-right">
        <SortableHeader column={column} title="% of GDP" className="text-slate-900 dark:text-slate-100 justify-end w-full" />
      </div>
    ),
    cell: ({ row }) => <PercentageCell row={row.original} pctKey="reserveAllocationGdpPercent" usdKey="totalGdpUsd" />,
    sortUndefined: 'last',
  },
  {
    accessorFn: (row) => (row.totalHoldingsBtc === 0 || row.reserveAllocationReservesPercent === 0) ? undefined : row.reserveAllocationReservesPercent,
    id: "reserveAllocationReservesPercent",
    header: ({ column }) => (
      <div className="text-right">
        <SortableHeader column={column} title="% of Reserves" className="text-slate-900 dark:text-slate-100 justify-end w-full" />
      </div>
    ),
    cell: ({ row }) => <PercentageCell row={row.original} pctKey="reserveAllocationReservesPercent" usdKey="totalReservesUsd" />,
    sortUndefined: 'last',
  },
]

const formatNumber = (num: number) => {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 't';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'b';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'm';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
  if (num < 1 && num > 0) return num.toFixed(2);
  return Math.round(num).toString();
};

function HoldingsCell({ row }: { row: UiAdoptionLeaderboardItem }) {
  const [showExact, setShowExact] = React.useState(false);
  
  const btcAmount = row.totalHoldingsBtc;
  const usdAmount = row.totalValueUsd;

  if (btcAmount === 0) {
    return <div className="text-muted-foreground tabular-nums">—</div>;
  }

  return (
    <div 
      className="flex items-center gap-1.5 py-1 cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation();
        setShowExact(!showExact);
      }}
    >
      {showExact ? (
        <div className="flex flex-col text-[10px] leading-none space-y-0.5 transition-all duration-200">
          <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {btcAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })} ₿
          </div>
          <div className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
            ${usdAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 transition-all duration-200">
          <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{formatNumber(btcAmount)} ₿</div>
          <div className="text-slate-400 font-medium text-sm">/</div>
          <div className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">${formatNumber(usdAmount)}</div>
        </div>
      )}
    </div>
  );
}

function AvgPurchasePriceCell({ row }: { row: UiAdoptionLeaderboardItem }) {
  const { totalEntryValueUsd, totalHoldingsBtc, totalValueUsd } = row;

  if (totalHoldingsBtc === 0) {
    return <div className="text-right text-muted-foreground tabular-nums">—</div>;
  }

  if (totalEntryValueUsd !== undefined && totalEntryValueUsd > 0) {
    const avgPrice = totalEntryValueUsd / totalHoldingsBtc;
    const currentPrice = totalValueUsd / totalHoldingsBtc;
    
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div className="text-right font-medium text-slate-900 dark:text-slate-100 tabular-nums">
          ${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <PricePerformance entryPrice={avgPrice} currentPrice={currentPrice} />
      </div>
    );
  }

  return <div className="text-right text-muted-foreground tabular-nums">—</div>;
}

function PricePerformance({ entryPrice, currentPrice }: { entryPrice: number, currentPrice: number }) {
  if (!entryPrice || !currentPrice) return null;
  
  const isLower = entryPrice < currentPrice;
  const diffPct = Math.abs((entryPrice - currentPrice) / currentPrice) * 100;

  if (Math.abs(diffPct) < 0.01) return null;

  return (
    <div className={`flex items-center gap-1 text-[10px] font-bold ${isLower ? 'text-emerald-500' : 'text-red-500'}`}>
      <Triangle className={`h-2 w-2 fill-current ${isLower ? 'rotate-180' : ''}`} />
      <span>{diffPct.toFixed(1)}% {isLower ? 'lower' : 'higher'}</span>
    </div>
  );
}

function PercentageCell({ row, pctKey, usdKey }: { row: UiAdoptionLeaderboardItem, pctKey: 'reserveAllocationGdpPercent' | 'reserveAllocationReservesPercent', usdKey: 'totalGdpUsd' | 'totalReservesUsd' }) {
  const [showRaw, setShowRaw] = React.useState(false);
  
  const btcAmount = row.totalHoldingsBtc;
  const pct = row[pctKey];
  const usdValue = row.totalValueUsd;
  const denominatorUsd = row[usdKey];

  if (btcAmount === 0 || isNaN(pct) || pct === 0) {
    return <div className="text-right text-muted-foreground tabular-nums">—</div>;
  }

  let colorClass = "text-emerald-600 dark:text-emerald-400";
  if (pct >= 5) colorClass = "text-red-600 dark:text-red-500";
  else if (pct >= 1) colorClass = "text-amber-500 dark:text-amber-400";

  return (
    <div 
      className={`text-right font-bold tabular-nums cursor-pointer select-none ${colorClass}`}
      onClick={(e) => {
        e.stopPropagation();
        setShowRaw(!showRaw);
      }}
    >
      {showRaw ? (
        <span className="text-xs transition-all duration-200">
          ${formatNumber(usdValue)} / ${formatNumber(denominatorUsd)}
        </span>
      ) : (
        <span className="transition-all duration-200">{pct.toFixed(2)}%</span>
      )}
    </div>
  );
}

export function AdoptionLeaderboard() {
  const { data, isLoading } = useAdoptionLeaderboard();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "totalHoldingsBtc", desc: true }
  ])

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  if (isLoading) {
    return <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-xl animate-pulse border">Loading Leaderboard...</div>;
  }

  return (
    <div className="rounded-xl border shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                onClick={() => console.log('Open drilldown for', row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No adoption data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
