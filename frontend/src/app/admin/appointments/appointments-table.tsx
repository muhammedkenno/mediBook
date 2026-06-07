"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import StatusUpdater from "./status-updater"

export interface AppointmentRow {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  doctor: { full_name: string; specialty: string } | null
  patient: { full_name: string } | null
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
  if (sorted === "asc") return <ArrowUp className="size-3.5 text-primary" />
  return <ArrowDown className="size-3.5 text-primary" />
}

export function AppointmentsTable({ data, statusLabels }: {
  data: AppointmentRow[]
  statusLabels: { pending: string; confirmed: string; cancelled: string }
}) {
  const t = useTranslations("admin")
  const [sorting,      setSorting]      = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const statusVariant = (s: string) =>
    s === "confirmed" ? "success" : s === "cancelled" ? "destructive" : "warning"

  const statusLabel = (s: string) =>
    s === "confirmed" ? statusLabels.confirmed
    : s === "cancelled" ? statusLabels.cancelled
    : statusLabels.pending

  const columns: ColumnDef<AppointmentRow>[] = [
    {
      id: "patient",
      accessorFn: row => row.patient?.full_name ?? "",
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("patient")} <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.patient?.full_name ?? "—"}</span>,
    },
    {
      id: "doctor",
      accessorFn: row => row.doctor?.full_name ?? "",
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("doctor")} <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.doctor?.full_name ?? "—"}</span>,
    },
    {
      accessorKey: "specialty",
      accessorFn: row => row.doctor?.specialty ?? "",
      header: () => <span className="font-medium hidden md:block">{t("specialty")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground hidden md:block">
          {row.original.doctor?.specialty ?? "—"}
        </span>
      ),
    },
    {
      id: "datetime",
      accessorFn: row => `${row.appointment_date} ${row.appointment_time}`,
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("time")} <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.appointment_date} · {row.original.appointment_time}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("status")} <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status) as any}>
          {statusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <span className="font-medium">{t("update")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <StatusUpdater appointmentId={row.original.id} currentStatus={row.original.status as any} />
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Input
          placeholder={`${t("patient")} / ${t("doctor")}…`}
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-sm text-muted-foreground shrink-0">
          {table.getFilteredRowModel().rows.length} {t("appointments").toLowerCase()}
        </span>
      </div>

      <div className="rounded-xl border overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                {hg.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-12">
                  {t("noAppointments")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm"
              onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
