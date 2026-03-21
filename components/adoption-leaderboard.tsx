'use client';

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

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
    accessorKey: "totalHoldingsBtc",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent px-0 text-amber-600/80 hover:text-amber-600 font-semibold"
        >
          Holdings
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <HoldingsCell row={row.original} />
  },
  {
    accessorKey: "reserveAllocationGdpPercent",
    header: () => <div className="text-right">% of GDP</div>,
    cell: ({ row }) => <GdpCell row={row.original} />
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
          <div className="font-bold tabular-nums text-amber-500">
            {btcAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })} ₿
          </div>
          <div className="font-medium text-white tabular-nums">
            ${usdAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 transition-all duration-200">
          <div className="font-bold tabular-nums text-amber-500">{formatNumber(btcAmount)} ₿</div>
          <div className="text-slate-400 font-medium text-sm">/</div>
          <div className="font-medium text-white tabular-nums">${formatNumber(usdAmount)}</div>
        </div>
      )}
    </div>
  );
}

function GdpCell({ row }: { row: UiAdoptionLeaderboardItem }) {
  const [showRaw, setShowRaw] = React.useState(false);
  
  const btcAmount = row.totalHoldingsBtc;
  const pct = row.reserveAllocationGdpPercent;
  const usdValue = row.totalValueUsd;
  const gdpUsd = row.totalGdpUsd;

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
          ${formatNumber(usdValue)} / ${formatNumber(gdpUsd)}
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
