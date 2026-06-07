"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { updateAppointmentStatus } from "@/lib/actions/appointments"

const STATUSES = ["pending", "confirmed", "cancelled"] as const
type Status = typeof STATUSES[number]

export default function StatusUpdater({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string
  currentStatus: Status
}) {
  const t = useTranslations("admin")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const label = (s: Status) =>
    s === "confirmed" ? t("statusConfirmed")
    : s === "cancelled" ? t("statusCancelled")
    : t("statusPending")

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Status
    startTransition(async () => {
      await updateAppointmentStatus({ appointmentId, status: newStatus })
      router.refresh()
    })
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      aria-label={t("status")}
      className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{label(s)}</option>
      ))}
    </select>
  )
}
