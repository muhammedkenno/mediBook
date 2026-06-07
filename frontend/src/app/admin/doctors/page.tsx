import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const metadata: Metadata = { title: "Doctors — Admin" }
import { StaggerContainer, StaggerItem } from "@/components/motion/primitives"
import { AddDoctorForm } from "./add-doctor-form"
import { DoctorsTable } from "./doctors-table"

export default async function AdminDoctorsPage() {
  const t = await getTranslations("admin")
  const supabase = await createServerSupabaseClient()

  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, full_name, specialty, available_days, bio, created_at")
    .order("specialty")
    .order("full_name")

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("doctors")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("doctorsSubtitle")}</p>
      </div>

      {/* Add Doctor form — slides in when opened */}
      <AddDoctorForm />

      {/* Doctors table with sort / filter / pagination */}
      <DoctorsTable data={doctors ?? []} />
    </div>
  )
}
