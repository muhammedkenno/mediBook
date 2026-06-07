"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarDays, Clock, Stethoscope, FileText, X, Loader2 } from "lucide-react"
import { cancelAppointment } from "@/lib/actions/appointments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AppointmentData {
  id: string
  appointment_date: string
  appointment_time: string
  status: "pending" | "confirmed" | "cancelled"
  notes: string | null
  created_at: string
  doctor: { id: string; full_name: string; specialty: string } | null
}

const STATUS_VARIANT: Record<string, "warning" | "success" | "destructive"> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "destructive",
}

export function AppointmentCard({ appointment }: { appointment: AppointmentData }) {
  const t = useTranslations("appointments")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [armed, setArmed] = useState(false)

  const isCancellable =
    appointment.status !== "cancelled" &&
    appointment.appointment_date >= new Date().toISOString().slice(0, 10)

  function handleCancel() {
    if (!armed) {
      setArmed(true)
      toast.warning(t("cancelConfirm"), {
        duration: 5000,
        action: {
          label: t("cancel"),
          onClick: () => {
            startTransition(async () => {
              const result = await cancelAppointment(appointment.id)
              if (result.error) {
                toast.error(result.error)
              } else {
                toast.success(t("cancelled"))
                router.refresh()
              }
              setArmed(false)
            })
          },
        },
        onDismiss: () => setArmed(false),
        onAutoClose: () => setArmed(false),
      })
    }
  }

  const statusLabel =
    appointment.status === "confirmed"
      ? t("statusConfirmed")
      : appointment.status === "cancelled"
        ? t("statusCancelled")
        : t("statusPending")

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Colored top bar */}
        <div
          className={`h-1 w-full ${
            appointment.status === "confirmed"
              ? "bg-emerald-500"
              : appointment.status === "cancelled"
                ? "bg-rose-400"
                : "bg-amber-400"
          }`}
        />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* Doctor info */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">
                  {appointment.doctor?.full_name ?? "—"}
                </p>
                <Badge variant={STATUS_VARIANT[appointment.status] as any}>
                  {statusLabel}
                </Badge>
              </div>
              {appointment.doctor?.specialty && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Stethoscope className="size-3.5 shrink-0" />
                  {appointment.doctor.specialty}
                </div>
              )}
            </div>

            {/* Cancel button */}
            {isCancellable && (
              <Button
                variant={armed ? "destructive" : "outline"}
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
                className="shrink-0 gap-1.5"
              >
                {isPending ? (
                  <><Loader2 className="size-3.5 animate-spin" />{t("cancelling")}</>
                ) : (
                  <><X className="size-3.5" />{t("cancel")}</>
                )}
              </Button>
            )}
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" />
              {appointment.appointment_date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" />
              {appointment.appointment_time.slice(0, 5)}
            </span>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
              <FileText className="size-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{appointment.notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
