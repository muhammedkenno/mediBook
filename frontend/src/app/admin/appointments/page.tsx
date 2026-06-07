import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = { title: "All Appointments — Admin" }
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { AppointmentsTable, type AppointmentRow } from "./appointments-table"

export default async function AdminAppointmentsPage() {
  const t = await getTranslations("admin")
  const supabase = await createServerSupabaseClient()

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id, appointment_date, appointment_time, status,
      doctor:doctors(full_name, specialty),
      patient:profiles(full_name)
    `)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })

  const rows: AppointmentRow[] = (appointments ?? []).map((a: any) => ({
    id: a.id,
    appointment_date: a.appointment_date,
    appointment_time: a.appointment_time,
    status: a.status,
    doctor: a.doctor ?? null,
    patient: a.patient ?? null,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("allAppointments")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>

      <AppointmentsTable
        data={rows}
        statusLabels={{
          pending:   t("statusPending"),
          confirmed: t("statusConfirmed"),
          cancelled: t("statusCancelled"),
        }}
      />
    </div>
  )
}
