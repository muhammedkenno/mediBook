"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"
import { UpdateStatusSchema } from "@/lib/validation"
import { notifyAppointment, type NotificationType } from "@/lib/notifications"

const BookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time"),
  notes: z.string().trim().max(1000).optional().nullable(),
})

export async function bookAppointment(input: {
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  notes?: string | null
}): Promise<{ id: string }> {
  const parsed = BookAppointmentSchema.parse(input)

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: user.id,
      doctor_id: parsed.doctorId,
      appointment_date: parsed.appointmentDate,
      appointment_time: parsed.appointmentTime,
      notes: parsed.notes ?? null,
    })
    .select("id")
    .single()

  if (error) {
    // Postgres unique-constraint violation code is "23505".
    // The partial index only covers non-cancelled rows, so this means
    // an active booking already exists for this doctor/date/time slot.
    if (error.code === "23505") {
      throw new Error(
        "This time slot has just been taken. Please go back and choose a different time."
      )
    }
    throw new Error(error.message)
  }

  // Fire the "pending review" notification — best-effort, never blocks.
  await notifyAppointment({
    type: "appointment_pending",
    appointmentId: data.id,
    patientId: user.id,
  })

  revalidatePath("/admin/appointments")
  revalidatePath("/admin/dashboard")

  return { id: data.id }
}

export async function updateAppointmentStatus(input: {
  appointmentId: string
  status: string
}) {
  const { appointmentId, status } = UpdateStatusSchema.parse(input)

  // Verify the caller is a real, signed-in admin — server-side, not trusting
  // the client. Only then do we use the privileged service-role client.
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") throw new Error("Forbidden")

  const { error } = await createAdminClient()
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)

  if (error) throw new Error(error.message)

  // Fire the notification side-effect (best-effort; never throws).
  if (status === "confirmed" || status === "cancelled") {
    const type: NotificationType =
      status === "confirmed" ? "appointment_confirmed" : "appointment_cancelled"
    await notifyAppointment({ type, appointmentId, patientId: null })
  }

  revalidatePath("/admin/appointments")
  revalidatePath("/admin/dashboard")
}

export async function cancelAppointment(appointmentId: string): Promise<{ error?: string }> {
  try {
    if (!z.string().uuid().safeParse(appointmentId).success) {
      return { error: "Invalid appointment ID" }
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Verify ownership — patient can only cancel their own appointments
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, patient_id, status")
      .eq("id", appointmentId)
      .single()

    if (fetchError || !appointment) return { error: "Appointment not found" }
    if (appointment.patient_id !== user.id) return { error: "Forbidden" }
    if (appointment.status === "cancelled") return { error: "Already cancelled" }

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId)
      .eq("patient_id", user.id) // double-guard: RLS + explicit filter

    if (error) return { error: error.message }

    // Notify patient of their own cancellation (best-effort)
    await notifyAppointment({
      type: "appointment_cancelled",
      appointmentId,
      patientId: user.id,
    })

    revalidatePath("/appointments")
    revalidatePath("/admin/appointments")
    revalidatePath("/admin/dashboard")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server error" }
  }
}
