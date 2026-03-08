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
    header: "Entity & Country",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className="font-medium text-slate-900 dark:text-slate-100">{row.getValue("name")}</div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
          {row.original.countryCode || 'N/A'}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "policyStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("policyStatus") as string;
      const getBadgeColor = () => {
        if (status === 'Legal Tender') return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50";
        if (status === 'Strategic Reserve') return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
        if (status === 'Invested') return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      };
      
      return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getBadgeColor()}`}>
          {status}
        </span>
      );
    },
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
          BTC Holdings
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalHoldingsBtc"));
      return <div className="font-bold tabular-nums text-amber-500">{amount.toLocaleString()} ₿</div>
    },
  },
  {
    accessorKey: "totalValueUsd",
    header: () => <div className="text-right">USD Value</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalValueUsd"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(amount)
      return <div className="text-right font-medium text-slate-600 dark:text-slate-300 tabular-nums">{formatted}</div>
    },
  },
  {
    accessorKey: "reserveAllocationGdpPercent",
    header: () => <div className="text-right">% of GDP</div>,
    cell: ({ row }) => {
      const pct = parseFloat(row.getValue("reserveAllocationGdpPercent"));
      if (pct === 0) return <div className="text-right text-muted-foreground tabular-nums">—</div>;
      return <div className="text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{pct.toFixed(2)}%</div>
    },
  },
]

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
