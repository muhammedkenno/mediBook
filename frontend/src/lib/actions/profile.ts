"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const UpdateProfileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
})

const UpdatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export async function updateProfile(
  input: { full_name: string },
): Promise<{ error?: string }> {
  try {
    const parsed = UpdateProfileSchema.safeParse(input)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.full_name })
      .eq("id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/profile")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server error" }
  }
}

export async function updatePassword(
  input: { password: string; confirmPassword: string },
): Promise<{ error?: string }> {
  try {
    const parsed = UpdatePasswordSchema.safeParse(input)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
    if (error) return { error: error.message }

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server error" }
  }
}
