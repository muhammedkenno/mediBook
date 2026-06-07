import { getTranslations } from "next-intl/server"
import { NavbarClient } from "@/components/navbar-client"
import { NotificationBellSlot } from "@/components/notification-bell-slot"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function SiteNav({ children }: { children?: React.ReactNode }) {
  const [tc, tn] = await Promise.all([
    getTranslations("common"),
    getTranslations("nav"),
  ])

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName: string | null = null
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single()
    displayName = profile?.full_name || user.email || null
    isAdmin = profile?.role === "admin"
  }

  return (
    <NavbarClient
      isLoggedIn={!!user}
      displayName={displayName}
      isAdmin={isAdmin}
      brandLabel={tc("brand")}
      signInLabel={tn("signIn")}
      getStartedLabel={tn("getStarted")}
      dashboardLabel={tn("dashboard")}
      appointmentsLabel={tn("appointments")}
      profileLabel={tn("profile")}
      signOutLabel={tn("signOut")}
      welcomeLabel={tn("welcome", { name: displayName ?? "" })}
      extraLink={children}
      notificationSlot={<NotificationBellSlot />}
      languageSlot={<LanguageSwitcher />}
    />
  )
}
