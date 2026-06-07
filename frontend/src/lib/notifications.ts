import "server-only"
import { createAdminClient } from "@/lib/supabase-admin"
import { sendAppointmentEmail } from "@/lib/email"
import type { AppointmentEmailKind } from "@/emails/appointment-email"

export type NotificationType =
  | "appointment_pending"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_reminder"

const KIND_FROM_TYPE: Record<NotificationType, AppointmentEmailKind> = {
  appointment_pending: "pending",
  appointment_confirmed: "confirmed",
  appointment_cancelled: "cancelled",
  appointment_reminder: "reminder",
}

const TITLE_BY_TYPE = {
  en: {
    appointment_pending: "Booking received",
    appointment_confirmed: "Appointment confirmed",
    appointment_cancelled: "Appointment cancelled",
    appointment_reminder: "Appointment reminder",
  },
  ar: {
    appointment_pending: "تم استلام الحجز",
    appointment_confirmed: "تم تأكيد الموعد",
    appointment_cancelled: "تم إلغاء الموعد",
    appointment_reminder: "تذكير بالموعد",
  },
} as const

const BODY_BY_TYPE = {
  en: {
    appointment_pending: "Your appointment with {doctor} on {date} at {time} is pending review.",
    appointment_confirmed: "Your appointment with {doctor} on {date} at {time} has been confirmed.",
    appointment_cancelled: "Your appointment with {doctor} on {date} at {time} has been cancelled.",
    appointment_reminder: "Reminder: your appointment with {doctor} is coming up at {time}.",
  },
  ar: {
    appointment_pending: "موعدك مع {doctor} في {date} الساعة {time} قيد المراجعة.",
    appointment_confirmed: "تم تأكيد موعدك مع {doctor} في {date} الساعة {time}.",
    appointment_cancelled: "تم إلغاء موعدك مع {doctor} في {date} الساعة {time}.",
    appointment_reminder: "تذكير: موعدك مع {doctor} قريباً في {time}.",
  },
} as const

function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

export interface NotifyAppointmentArgs {
  type: NotificationType
  appointmentId: string
  /** Pass `null` if the patient isn't a registered user (e.g. anonymous bookings) */
  patientId: string | null
}

/**
 * Centralised side-effect for appointment events:
 *   1. Looks up the patient + doctor + appointment in one query
 *   2. Inserts a row into `notifications` (drives the in-app bell via Realtime)
 *   3. Sends a localized email via Resend (best-effort, won't throw)
 *
 * Returns silently — callers should never block on this.
 */
export async function notifyAppointment(args: NotifyAppointmentArgs): Promise<void> {
  try {
    const admin = createAdminClient()

    const { data: appt } = await admin
      .from("appointments")
      .select(`
        id, appointment_date, appointment_time,
        doctor:doctors(full_name, specialty),
        patient:profiles(id, full_name, preferred_locale)
      `)
      .eq("id", args.appointmentId)
      .single()

    if (!appt) return

    const doctor = (appt as any).doctor as { full_name: string; specialty: string } | null
    const patient = (appt as any).patient as
      | { id: string; full_name: string | null; preferred_locale: string | null }
      | null
    if (!patient || !doctor) return

    const locale: "en" | "ar" = patient.preferred_locale === "ar" ? "ar" : "en"
    const patientName = patient.full_name ?? "Patient"
    const dateLabel = appt.appointment_date as string
    const timeLabel = (appt.appointment_time as string).slice(0, 5) // HH:MM

    const vars = { doctor: doctor.full_name, date: dateLabel, time: timeLabel }
    const title = TITLE_BY_TYPE[locale][args.type]
    const body = fmt(BODY_BY_TYPE[locale][args.type], vars)

    // 1. In-app notification (Realtime fans it out to the bell)
    await admin.from("notifications").insert({
      user_id: patient.id,
      type: args.type,
      title,
      body,
      link: "/appointments",
      appointment_id: appt.id,
    })

    // 2. Email (best-effort)
    const patientEmail = await getPatientEmail(patient.id)
    if (patientEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      await sendAppointmentEmail({
        to: patientEmail,
        kind: KIND_FROM_TYPE[args.type],
        locale,
        patientName,
        doctorName: doctor.full_name,
        specialty: doctor.specialty,
        dateLabel,
        timeLabel,
        appointmentUrl: `${appUrl}/appointments`,
      })
    }
  } catch (err) {
    console.error("[notifyAppointment] failed:", err)
  }
}

async function getPatientEmail(userId: string): Promise<string | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.getUserById(userId)
    if (error || !data?.user?.email) return null
    return data.user.email
  } catch {
    return null
  }
}
