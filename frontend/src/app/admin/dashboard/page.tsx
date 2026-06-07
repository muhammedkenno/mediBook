import { getTranslations } from "next-intl/server"
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StaggerContainer, StaggerItem, ScrollReveal } from "@/components/motion/primitives"

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin")
  const supabase = await createServerSupabaseClient()

  const statusLabel = (s: string) =>
    s === "confirmed" ? t("statusConfirmed")
    : s === "cancelled" ? t("statusCancelled")
    : t("statusPending")

  const [
    { count: total },
    { count: pending },
    { count: confirmed },
    { count: cancelled },
    { count: emergency },
    { data: recent },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("triage_logs").select("*", { count: "exact", head: true }).eq("is_emergency", true),
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, notes, doctor:doctors(full_name, specialty), patient:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: t("totalAppointments"), value: total ?? 0, icon: CalendarDays, accent: "text-foreground bg-muted" },
    { label: t("pendingReview"), value: pending ?? 0, icon: Clock, accent: "text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300" },
    { label: t("confirmed"), value: confirmed ?? 0, icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300" },
    { label: t("cancelled"), value: cancelled ?? 0, icon: XCircle, accent: "text-muted-foreground bg-muted" },
    { label: t("emergencyFlags"), value: emergency ?? 0, icon: AlertTriangle, accent: "text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-300" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4" staggerChildren={0.07}>
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Card className="transition-shadow hover:shadow-md h-full">
              <CardContent className="flex flex-col gap-3 pt-2">
                <span className={`grid size-9 place-items-center rounded-lg ${s.accent}`}>
                  <s.icon className="size-4" />
                </span>
                <div>
                  <p className="text-3xl font-bold leading-none">{s.value}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div>
        <h2 className="text-lg font-semibold mb-4">{t("recentAppointments")}</h2>
        <div className="flex flex-col gap-3">
          {(recent ?? []).map((appt: any, i: number) => (
            <ScrollReveal key={appt.id} delay={i * 0.05}>
            <Card>
              <CardContent className="py-3 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">{(appt.patient as any)?.full_name ?? t("patient")}</p>
                  <p className="text-sm text-muted-foreground">
                    {(appt.doctor as any)?.full_name} · {(appt.doctor as any)?.specialty}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-sm">{appt.appointment_date} · {appt.appointment_time}</p>
                  <Badge
                    variant={
                      appt.status === "confirmed" ? "success"
                      : appt.status === "cancelled" ? "destructive"
                      : "warning"
                    }
                    className="mt-1"
                  >
                    {statusLabel(appt.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            </ScrollReveal>
          ))}
          {(!recent || recent.length === 0) && (
            <p className="text-muted-foreground text-sm">{t("noAppointments")}</p>
          )}
        </div>
      </div>
    </div>
  )
}
