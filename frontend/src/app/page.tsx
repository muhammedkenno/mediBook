import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Brain, Stethoscope, CalendarCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/home/hero-section"
import { SpecialtiesSection } from "@/components/home/specialties-section"
import { DoctorsIllustration } from "@/components/home/doctors-illustration"
import { DoctorsSectionClient } from "@/components/home/doctors-section"
import { ContactSection } from "@/components/home/contact-section"
import { ScrollReveal, MotionCard } from "@/components/motion/primitives"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { Doctor } from "@/types"

async function fetchDoctors(): Promise<Doctor[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("doctors")
      .select("id, full_name, specialty, available_days, bio, created_at")
      .order("full_name")
      .limit(8)
    if (error) {
      console.error("Failed to fetch doctors for landing page:", error.message)
      return []
    }
    return (data ?? []) as Doctor[]
  } catch {
    return []
  }
}

export const metadata: Metadata = {
  title: "MediBook — AI-Powered Hospital Booking",
  description:
    "Describe your symptoms, let our AI identify what you might have and recommend the right specialist — then book an appointment instantly.",
  openGraph: {
    title: "MediBook — AI-Powered Hospital Booking",
    description: "The smarter way to book a doctor appointment.",
    url: "/",
  },
}

export default async function LandingPage() {
  const [t, doctors] = await Promise.all([
    getTranslations("landing"),
    fetchDoctors(),
  ])

  const features = [
    { icon: Brain,         title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: Stethoscope,   title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: CalendarCheck, title: t("feature3Title"), desc: t("feature3Desc") },
  ]

  return (
    <main className="flex flex-col min-h-screen">
      <SiteNav />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div id="home">
        <HeroSection />
      </div>

      {/* ── Doctors illustration (decorative) ─────────────────────────── */}
      <div
        aria-hidden
        className="relative w-full flex justify-center items-end overflow-visible pointer-events-none -mt-38 -mb-12 z-0"
      >
        <DoctorsIllustration />
      </div>

      {/* ── Medical Specialties ───────────────────────────────────────── */}
      <div id="specialties">
        <SpecialtiesSection />
      </div>

      {/* ── Our Doctors ───────────────────────────────────────────────── */}
      <div id="doctors">
        <DoctorsSectionClient doctors={doctors} />
      </div>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-label="How it works"
        className="px-4 sm:px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto w-full"
      >
        {features.map((f, i) => (
          <ScrollReveal key={f.title} delay={i * 0.08}>
            <MotionCard className="h-full">
              <Card className="h-full border-0 shadow-sm">
                <CardContent className="pt-2 flex flex-col gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="font-semibold text-base">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </MotionCard>
          </ScrollReveal>
        ))}
      </section>

      {/* ── Contact Us ────────────────────────────────────────────────── */}
      <div id="contact">
        <ContactSection />
      </div>

      <SiteFooter />
    </main>
  )
}
