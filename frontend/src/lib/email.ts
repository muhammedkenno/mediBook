import "server-only"
import { Resend } from "resend"
import AppointmentEmail, { type AppointmentEmailKind } from "@/emails/appointment-email"

const resendKey = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev"

const resend = resendKey ? new Resend(resendKey) : null

const SUBJECTS: Record<AppointmentEmailKind, { en: string; ar: string }> = {
  pending: {
    en: "Booking received — pending review",
    ar: "تم استلام الحجز — قيد المراجعة",
  },
  confirmed: { en: "Your appointment is confirmed", ar: "تم تأكيد موعدك" },
  cancelled: { en: "Your appointment was cancelled", ar: "تم إلغاء موعدك" },
  reminder: { en: "Reminder: appointment coming up", ar: "تذكير: موعد قادم" },
}

export interface SendAppointmentEmailArgs {
  to: string
  kind: AppointmentEmailKind
  locale: "en" | "ar"
  patientName: string
  doctorName: string
  specialty: string
  dateLabel: string
  timeLabel: string
  appointmentUrl: string
}

/**
 * Sends a localized appointment email. Returns true on success, false on failure
 * (callers must NEVER let an email error break the user-visible flow).
 */
export async function sendAppointmentEmail(args: SendAppointmentEmailArgs): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send")
    return false
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: SUBJECTS[args.kind][args.locale],
      react: AppointmentEmail({
        kind: args.kind,
        locale: args.locale,
        patientName: args.patientName,
        doctorName: args.doctorName,
        specialty: args.specialty,
        dateLabel: args.dateLabel,
        timeLabel: args.timeLabel,
        appointmentUrl: args.appointmentUrl,
      }),
    })
    if (error) {
      console.error("[email] Resend error:", error)
      return false
    }
    return true
  } catch (err) {
    console.error("[email] send threw:", err)
    return false
  }
}
