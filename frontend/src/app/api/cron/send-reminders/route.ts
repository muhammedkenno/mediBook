import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { notifyAppointment } from "@/lib/notifications"

/**
 * Triggered by pg_cron every 15 minutes via pg_net (see supabase/pg_cron.sql).
 * Guard: `Authorization: Bearer <CRON_SECRET>` must match the server env var.
 *
 * Finds confirmed appointments starting in the next 60–90 minutes that haven't
 * had a reminder sent yet, fires the email + in-app notification, then stamps
 * `reminder_sent_at` so we never double-send.
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = new Date()
  const windowStart = now.toISOString()
  const windowEnd = new Date(now.getTime() + 90 * 60_000).toISOString()

  const admin = createAdminClient()

  // Combine date + time into a real timestamp via Postgres expression
  const { data, error } = await admin
    .from("appointments")
    .select("id, appointment_date, appointment_time, status, reminder_sent_at")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("appointment_date", now.toISOString().split("T")[0])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter in JS (PostgREST can't combine date + time columns directly)
  const due = (data ?? []).filter((a) => {
    const ts = new Date(`${a.appointment_date}T${a.appointment_time}`)
    return ts.toISOString() >= windowStart && ts.toISOString() <= windowEnd
  })

  let sent = 0
  for (const appt of due) {
    await notifyAppointment({
      type: "appointment_reminder",
      appointmentId: appt.id,
      patientId: null,
    })
    await admin
      .from("appointments")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", appt.id)
    sent++
  }

  return NextResponse.json({ sent, checked: data?.length ?? 0 })
}
