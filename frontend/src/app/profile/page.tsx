import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { User } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { ProfileForm } from "./profile-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile")
  return { title: `${t("title")} — MediBook` }
}

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const t = await getTranslations("profile")

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <div className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-1">
          <User className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">{t("subtitle")}</p>

        <ProfileForm
          initialName={profile?.full_name ?? ""}
          email={user.email ?? ""}
        />
      </div>
      <SiteFooter />
    </div>
  )
}
