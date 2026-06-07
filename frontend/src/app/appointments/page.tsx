import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { CalendarDays, Plus } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { buttonVariants } from "@/components/ui/button"
import { AppointmentCard } from "./appointment-card"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("appointments")
  return { title: `${t("title")} — MediBook` }
}

export default async function AppointmentsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const t = await getTranslations("appointments")

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id, appointment_date, appointment_time, status, notes, created_at,
      doctor:doctors(id, full_name, specialty)
    `)
    .eq("patient_id", user.id)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })

  type AppointmentWithDoctor = {
    id: string
    appointment_date: string
    appointment_time: string
    status: "pending" | "confirmed" | "cancelled"
    notes: string | null
    created_at: string
    doctor: { id: string; full_name: string; specialty: string } | null
  }

  const rows = ((appointments ?? []) as unknown) as AppointmentWithDoctor[]

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <div className="flex-1 px-4 py-12 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="size-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            </div>
            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>
          <Link href="/book" className={buttonVariants({ size: "sm" }) + " gap-1.5 shrink-0"}>
            <Plus className="size-4" />
            {t("bookNow")}
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <CalendarDays className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">{t("noAppointments")}</p>
              <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
            </div>
            <Link href="/book" className={buttonVariants({ variant: "default" }) + " gap-1.5 mt-2"}>
              <Plus className="size-4" />
              {t("bookNow")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
