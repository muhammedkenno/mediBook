"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { useForm, Controller, type Resolver } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
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
import {
  ArrowUpDown, ArrowUp, ArrowDown, Trash2, Pencil,
  ChevronLeft, ChevronRight, X, Loader2, Save,
} from "lucide-react"
import { deleteDoctor, updateDoctor } from "@/lib/actions/doctors"
import {
  SPECIALTIES, WEEKDAYS,
  CreateDoctorSchema,
  type CreateDoctorInput,
} from "@/lib/doctor-constants"
import type { Doctor } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const SPECIALTY_COLORS: Record<string, string> = {
  "Cardiology":         "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300",
  "Neurology":          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Respiratory":        "bg-sky-100    text-sky-700    dark:bg-sky-900/30    dark:text-sky-300",
  "Gastroenterology":   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "General Practice":   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Dermatology":        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Infectious Disease": "bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-300",
  "Emergency":          "bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300",
  "Orthopedics":        "bg-slate-100  text-slate-700  dark:bg-slate-800/60  dark:text-slate-300",
  "Endocrinology":      "bg-pink-100   text-pink-700   dark:bg-pink-900/30   dark:text-pink-300",
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
  if (sorted === "asc") return <ArrowUp className="size-3.5 text-primary" />
  return <ArrowDown className="size-3.5 text-primary" />
}

// ── Edit modal ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolver: Resolver<CreateDoctorInput> = async (values: any) => {
  const result = CreateDoctorSchema.safeParse(values)
  if (result.success) return { values: result.data, errors: {} }
  const errors: Record<string, any> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "root"
    if (!errors[key]) errors[key] = { type: "validation", message: issue.message }
  }
  return { values: {} as any, errors }
}

const spring = { type: "spring", stiffness: 340, damping: 30 } as const

function EditModal({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
  const t = useTranslations("admin")
  const router = useRouter()

  const {
    register, control, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateDoctorInput>({
    resolver,
    defaultValues: {
      full_name:      doctor.full_name,
      specialty:      doctor.specialty as CreateDoctorInput["specialty"],
      bio:            doctor.bio ?? "",
      available_days: doctor.available_days as CreateDoctorInput["available_days"],
    },
  })

  async function onSubmit(data: CreateDoctorInput) {
    const result = await updateDoctor(doctor.id, data)
    if (result.error) { toast.error(result.error); return }
    toast.success(t("doctorUpdated"))
    router.refresh()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <motion.div
        key="edit-modal"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={spring}
        className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto max-w-lg rounded-xl border bg-card shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Pencil className="size-4 text-primary" />
            <h3 className="font-semibold text-sm">{t("editDoctor")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t("cancel")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit_full_name">{t("fullName")} *</Label>
              <Input
                id="edit_full_name"
                {...register("full_name")}
                aria-invalid={!!errors.full_name}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            {/* Specialty */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit_specialty">{t("specialtyLabel")} *</Label>
              <Controller
                name="specialty"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="edit_specialty"
                    className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                    aria-invalid={!!errors.specialty}
                  >
                    <option value="">{t("selectSpecialty")}</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              />
              {errors.specialty && (
                <p className="text-xs text-destructive">{errors.specialty.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="edit_bio">{t("bioLabel")}</Label>
              <Textarea
                id="edit_bio"
                rows={2}
                className="resize-none"
                placeholder={t("bioPlaceholder")}
                {...register("bio")}
              />
            </div>

            {/* Available days */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("availableDays")} *</Label>
              <Controller
                name="available_days"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map(day => {
                      const checked = field.value.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const next = checked
                              ? field.value.filter(d => d !== day)
                              : [...field.value, day]
                            field.onChange(next)
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all select-none ${
                            checked
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
              {errors.available_days && (
                <p className="text-xs text-destructive">{errors.available_days.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
              {isSubmitting
                ? <><Loader2 className="size-4 animate-spin" />{t("saving")}</>
                : <><Save className="size-4" />{t("save")}</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  )
}

// ── Delete button ─────────────────────────────────────────────────────────────
function DeleteButton({ id }: { id: string }) {
  const t = useTranslations("admin")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [armed, setArmed] = useState(false)

  function handleClick() {
    if (!armed) {
      setArmed(true)
      toast.warning(t("confirmDelete"), {
        duration: 5000,
        action: {
          label: t("deleteDoctor"),
          onClick: () => {
            startTransition(async () => {
              const result = await deleteDoctor(id)
              if (result.error) { toast.error(result.error); return }
              toast.success(t("doctorDeleted"))
              router.refresh()
            })
          },
        },
        onDismiss: () => setArmed(false),
        onAutoClose: () => setArmed(false),
      })
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={t("deleteDoctor")}
      className={`grid size-7 place-items-center rounded-md border transition-colors disabled:opacity-50 ${
        armed
          ? "border-destructive text-destructive bg-destructive/5"
          : "text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/5"
      }`}
    >
      {isPending
        ? <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        : <Trash2 className="size-3.5" />}
    </button>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────
export function DoctorsTable({ data }: { data: Doctor[] }) {
  const t = useTranslations("admin")
  const [sorting,       setSorting]       = useState<SortingState>([])
  const [globalFilter,  setGlobalFilter]  = useState("")
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("doctor")} <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.full_name}</span>
      ),
    },
    {
      accessorKey: "specialty",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("specialty")} <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const spec = row.original.specialty
        const cls  = SPECIALTY_COLORS[spec] ?? "bg-muted text-muted-foreground"
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
            {spec}
          </span>
        )
      },
    },
    {
      accessorKey: "available_days",
      header: () => <span className="font-medium hidden md:block">{t("availableDays")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground hidden md:block">
          {row.original.available_days.map(d => d.slice(0, 3)).join(", ")}
        </span>
      ),
    },
    {
      accessorKey: "bio",
      header: () => <span className="font-medium hidden lg:block">{t("bioLabel")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate hidden lg:block">
          {row.original.bio ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEditingDoctor(row.original)}
            aria-label={t("editDoctor")}
            className="grid size-7 place-items-center rounded-md border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Pencil className="size-3.5" />
          </button>
          <DeleteButton id={row.original.id} />
        </div>
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
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Input
            placeholder={t("searchDoctors")}
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <span className="text-sm text-muted-foreground shrink-0">
            {table.getFilteredRowModel().rows.length} {t("doctors").toLowerCase()}
          </span>
        </div>

        {/* Table */}
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
                    {t("noDoctors")}
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

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal — rendered outside table flow */}
      <AnimatePresence>
        {editingDoctor && (
          <EditModal
            doctor={editingDoctor}
            onClose={() => setEditingDoctor(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
