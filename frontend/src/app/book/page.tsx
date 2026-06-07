import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { buttonVariants } from "@/components/ui/button"
import { SiteNav } from "@/components/site-nav"
import BookingClient from "./booking-client"
import { DoctorGridSkeleton } from "./doctor-skeleton"

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Choose a specialist and pick a date and time that works for you. Quick, easy, and AI-guided.",
  openGraph: {
    title: "Book an Appointment — MediBook",
    description: "Choose a specialist and book your appointment in minutes.",
  },
}

export default async function BookPage() {
  const t = await getTranslations("booking")
  const tn = await getTranslations("nav")

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav>
        <a href="/check-symptoms" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          {tn("checkSymptomsFirst")}
        </a>
      </SiteNav>
      <div className="flex-1 px-4 py-12 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-8">{t("subtitle")}</p>
        <Suspense fallback={<DoctorGridSkeleton />}>
          <BookingClient />
        </Suspense>
      </div>
    </div>
  )
}
