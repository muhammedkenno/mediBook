import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { buttonVariants } from "@/components/ui/button"
import { SiteNav } from "@/components/site-nav"
import { SymptomChecker } from "./symptom-checker"

export const metadata: Metadata = {
  title: "AI Symptom Checker",
  description:
    "Describe your symptoms and let MediBook's AI triage engine identify the likely condition and recommend the right specialist.",
  openGraph: {
    title: "AI Symptom Checker — MediBook",
    description: "Get an instant AI-powered assessment of your symptoms.",
  },
}

export default async function CheckSymptomsPage() {
  const tn = await getTranslations("nav")

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav>
        <a href="/book" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          {tn("browseDoctors")}
        </a>
      </SiteNav>
      <div className="flex-1 px-4 py-12">
        <SymptomChecker />
      </div>
    </div>
  )
}
