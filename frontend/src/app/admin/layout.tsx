import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NotificationBellSlot } from "@/components/notification-bell-slot"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AdminNavbarClient } from "@/components/admin-navbar-client"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/")

  const tn = await getTranslations("nav")

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbarClient
        displayName={profile?.full_name ?? null}
        email={user.email ?? null}
        signOutLabel={tn("signOut")}
        notificationSlot={<NotificationBellSlot />}
        languageSlot={<LanguageSwitcher />}
      />
      <div className="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}
