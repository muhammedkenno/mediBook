import "server-only"
import { createAdminClient } from "@/lib/supabase-admin"

export interface DiseaseCount { name: string; count: number }
export interface SpecialtyCount { name: string; count: number }
export interface DayCount { date: string; count: number }
export interface StatusCount { status: string; count: number }

export interface AnalyticsData {
  totalAnalyses: number
  emergencyCount: number
  emergencyRate: number          // 0‥100 percentage
  avgConfidence: number | null   // null when triage_logs has no confidence col yet
  topDisease: string | null
  diseases: DiseaseCount[]       // top 10
  specialties: SpecialtyCount[]
  bookingsByDay: DayCount[]      // last 30 calendar days
  appointmentStatuses: StatusCount[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const admin = createAdminClient()

  // Fetch everything we need in parallel
  const [triageRes, appointmentsRes] = await Promise.all([
    admin
      .from("triage_logs")
      .select("predicted_disease, recommended_specialty, is_emergency, created_at"),
    admin
      .from("appointments")
      .select("status, created_at"),
  ])

  const logs = triageRes.data ?? []
  const appts = appointmentsRes.data ?? []

  // ── Disease distribution ─────────────────────────────────────────────────
  const diseaseMap = new Map<string, number>()
  let emergencyCount = 0

  for (const row of logs) {
    const d = row.predicted_disease ?? "Unknown"
    diseaseMap.set(d, (diseaseMap.get(d) ?? 0) + 1)
    if (row.is_emergency) emergencyCount++
  }

  const diseases: DiseaseCount[] = [...diseaseMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  // ── Specialty demand ─────────────────────────────────────────────────────
  const specMap = new Map<string, number>()
  for (const row of logs) {
    const s = row.recommended_specialty ?? "Unknown"
    specMap.set(s, (specMap.get(s) ?? 0) + 1)
  }
  const specialties: SpecialtyCount[] = [...specMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  // ── Bookings by day (last 30 days) ───────────────────────────────────────
  const now = new Date()
  const dayMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dayMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const a of appts) {
    const day = (a.created_at as string).slice(0, 10)
    if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1)
  }
  const bookingsByDay: DayCount[] = [...dayMap.entries()].map(([date, count]) => ({ date, count }))

  // ── Appointment status ───────────────────────────────────────────────────
  const statusMap = new Map<string, number>()
  for (const a of appts) {
    const s = (a.status as string) ?? "unknown"
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  }
  const appointmentStatuses: StatusCount[] = [...statusMap.entries()]
    .map(([status, count]) => ({ status, count }))

  // ── Summary KPIs ─────────────────────────────────────────────────────────
  const totalAnalyses = logs.length
  const emergencyRate = totalAnalyses > 0
    ? Math.round((emergencyCount / totalAnalyses) * 100)
    : 0
  const topDisease = diseases[0]?.name ?? null

  return {
    totalAnalyses,
    emergencyCount,
    emergencyRate,
    avgConfidence: null,
    topDisease,
    diseases,
    specialties,
    bookingsByDay,
    appointmentStatuses,
  }
}
