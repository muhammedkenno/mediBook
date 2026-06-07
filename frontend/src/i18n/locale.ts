"use server"

import { cookies } from "next/headers"
import { COOKIE_NAME, DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./config"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function getUserLocale(): Promise<Locale> {
  const stored = (await cookies()).get(COOKIE_NAME)?.value
  return SUPPORTED_LOCALES.includes(stored as Locale)
    ? (stored as Locale)
    : DEFAULT_LOCALE
}

export async function setUserLocale(locale: Locale) {
  ;(await cookies()).set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  })

  // Best-effort: persist on the profile so transactional emails (sent from
  // server actions / cron, where the cookie isn't in scope) match the user's
  // chosen language. Silently ignore if no session.
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ preferred_locale: locale })
        .eq("id", user.id)
    }
  } catch {
    // Never let locale persistence break the language switcher.
  }
}
