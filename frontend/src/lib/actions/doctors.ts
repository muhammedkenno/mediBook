"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"
import { CreateDoctorSchema, type CreateDoctorInput } from "@/lib/doctor-constants"

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")
}

export async function createDoctor(
  input: CreateDoctorInput,
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const parsed = CreateDoctorSchema.safeParse(input)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }
    const { error } = await createAdminClient()
      .from("doctors")
      .insert({
        full_name:      parsed.data.full_name,
        specialty:      parsed.data.specialty,
        bio:            parsed.data.bio ?? null,
        available_days: parsed.data.available_days,
      })
    if (error) return { error: error.message }
    revalidatePath("/admin/doctors")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server error" }
  }
}

export async function updateDoctor(
  id: string,
  input: CreateDoctorInput,
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    if (!z.string().uuid().safeParse(id).success) return { error: "Invalid ID" }
    const parsed = CreateDoctorSchema.safeParse(input)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }
    const { error } = await createAdminClient()
      .from("doctors")
      .update({
        full_name:      parsed.data.full_name,
        specialty:      parsed.data.specialty,
        bio:            parsed.data.bio ?? null,
        available_days: parsed.data.available_days,
      })
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/doctors")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server error" }
  }
}

export async function deleteDoctor(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    if (!z.string().uuid().safeParse(id).success) return { error: "Invalid ID" }
    const { error } = await createAdminClient()
      .from("doctors").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/doctors")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server error" }
  }
}
