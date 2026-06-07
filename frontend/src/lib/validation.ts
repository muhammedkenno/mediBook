import { z } from "zod"

export const SymptomsSchema = z.object({
  symptoms: z.string().trim().min(1, "Please describe your symptoms.").max(2000),
})

export const SignupSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export const APPOINTMENT_STATUSES = ["pending", "confirmed", "cancelled"] as const

export const UpdateStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(APPOINTMENT_STATUSES),
})
