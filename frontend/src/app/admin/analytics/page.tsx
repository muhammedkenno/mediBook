import { getTranslations } from "next-intl/server"
import {
  Activity, AlertTriangle, Stethoscope, TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnalyticsData } from "@/lib/analytics"
import {
  DiseaseChart,
  SpecialtyChart,
  BookingsTrendChart,
  StatusChart,
} from "./charts"

export default async function AnalyticsPage() {
  const t = await getTranslations("admin")
  const data = await getAnalyticsData()

  const kpis = [
    {
      label: t("totalAnalyses"),
      value: data.totalAnalyses,
      icon: Activity,
      accent: "text-primary bg-primary/10",
    },
    {
      label: t("emergencyRate"),
      value: `${data.emergencyRate}%`,
      icon: AlertTriangle,
      accent: data.emergencyRate > 20
        ? "text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-300"
        : "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    {
      label: t("topDisease"),
      value: data.topDisease ?? "—",
      icon: Stethoscope,
      accent: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300",
    },
    {
      label: t("totalAppointments"),
      value: data.appointmentStatuses.reduce((s, d) => s + d.count, 0),
      icon: TrendingUp,
      accent: "text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300",
    },
  ]

  const noData = t("noData")

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("analytics")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("analyticsSubtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3 pt-2">
              <span className={`grid size-9 place-items-center rounded-lg ${k.accent}`}>
                <k.icon className="size-4" />
              </span>
              <div>
                <p className="text-2xl sm:text-3xl font-bold leading-none truncate">{k.value}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1.5 leading-snug">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main charts — 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("diseaseDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DiseaseChart data={data.diseases} noDataMsg={noData} />
          </CardContent>
        </Card>

        {/* Specialty demand */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("specialtyDemand")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SpecialtyChart data={data.specialties} noDataMsg={noData} />
          </CardContent>
        </Card>

        {/* Appointment status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("appointmentStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart data={data.appointmentStatuses} noDataMsg={noData} />
          </CardContent>
        </Card>

        {/* Bookings trend — full width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("bookingsTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingsTrendChart data={data.bookingsByDay} noDataMsg={noData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
