// Plain module — no "use server" / "use client" directive.
// Safe to import from both server actions AND client components.
import { z } from "zod"

export const SPECIALTIES = [
  "Cardiology", "Neurology", "Respiratory", "Gastroenterology",
  "General Practice", "Dermatology", "Infectious Disease", "Emergency",
  "Orthopedics", "Endocrinology", "Urology", "Ophthalmology",
  "ENT", "Psychiatry", "Pediatrics",
] as const

export const WEEKDAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const

export const CreateDoctorSchema = z.object({
  full_name:      z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  specialty:      z.enum(SPECIALTIES, { error: "Please select a specialty" }),
  bio:            z.string().trim().max(500).optional(),
  available_days: z.array(z.enum(WEEKDAYS)).min(1, "Select at least one available day"),
})

export type CreateDoctorInput = z.infer<typeof CreateDoctorSchema>
