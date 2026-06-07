"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts"
import { useTranslations } from "next-intl"
import type { DiseaseCount, SpecialtyCount, DayCount, StatusCount } from "@/lib/analytics"

// ── Palette ─────────────────────────────────────────────────────────────────
const PRIMARY   = "hsl(var(--primary) / 1)"
const MUTED     = "hsl(var(--muted-foreground) / 0.4)"
const DONUT_COLORS = [
  "#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa",
]
const STATUS_COLOR: Record<string, string> = {
  confirmed: "#10b981",
  pending:   "#f59e0b",
  cancelled: "#f43f5e",
}

// Custom tooltip so it inherits the app's theme
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? PRIMARY }}>
          {p.name ? `${p.name}: ` : ""}{typeof p.value === "number" ? p.value : p.payload?.count}
        </p>
      ))}
    </div>
  )
}

// ── Disease bar chart ────────────────────────────────────────────────────────
export function DiseaseChart({ data, noDataMsg }: { data: DiseaseCount[]; noDataMsg: string }) {
  if (!data.length) return <p className="text-sm text-muted-foreground py-8">{noDataMsg}</p>
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={MUTED} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => v.length > 18 ? v.slice(0, 17) + "…" : v}
        />
        <Tooltip content={<ChartTip />} />
        <Bar dataKey="count" fill={PRIMARY} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Specialty donut chart ────────────────────────────────────────────────────
export function SpecialtyChart({ data, noDataMsg }: { data: SpecialtyCount[]; noDataMsg: string }) {
  if (!data.length) return <p className="text-sm text-muted-foreground py-8">{noDataMsg}</p>
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex flex-col gap-1.5 text-sm flex-1 min-w-0">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 min-w-0">
            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className="truncate flex-1">{d.name}</span>
            <span className="text-muted-foreground shrink-0">
              {Math.round((d.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Bookings trend line chart ────────────────────────────────────────────────
export function BookingsTrendChart({ data, noDataMsg }: { data: DayCount[]; noDataMsg: string }) {
  const hasData = data.some((d) => d.count > 0)
  if (!hasData) return <p className="text-sm text-muted-foreground py-8">{noDataMsg}</p>
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => v.slice(5)} // MM-DD
          interval={Math.floor(data.length / 6)}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
        <Tooltip content={<ChartTip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={PRIMARY}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Appointment status donut ─────────────────────────────────────────────────
export function StatusChart({ data, noDataMsg }: { data: StatusCount[]; noDataMsg: string }) {
  if (!data.length) return <p className="text-sm text-muted-foreground py-8">{noDataMsg}</p>
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((d) => (
              <Cell key={d.status} fill={STATUS_COLOR[d.status] ?? "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip content={<ChartTip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex flex-col gap-1.5 text-sm flex-1 min-w-0">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[d.status] ?? "#94a3b8" }} />
            <span className="capitalize flex-1">{d.status}</span>
            <span className="text-muted-foreground shrink-0">
              {d.count} ({Math.round((d.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
