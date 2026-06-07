"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, CalendarCheck, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/types"

// ── Specialty → colour token (matches specialties-section palette) ─────────
const SPECIALTY_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  Cardiology:          { bg: "bg-red-100 dark:bg-red-900/50",      text: "text-red-600 dark:text-red-400",      badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  Neurology:           { bg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
  Respiratory:         { bg: "bg-sky-100 dark:bg-sky-900/50",       text: "text-sky-600 dark:text-sky-400",       badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400" },
  Gastroenterology:    { bg: "bg-orange-100 dark:bg-orange-900/50", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  Ophthalmology:       { bg: "bg-teal-100 dark:bg-teal-900/50",     text: "text-teal-600 dark:text-teal-400",     badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400" },
  ENT:                 { bg: "bg-rose-100 dark:bg-rose-900/50",     text: "text-rose-600 dark:text-rose-400",     badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" },
  "General Practice":  { bg: "bg-blue-100 dark:bg-blue-900/50",     text: "text-blue-600 dark:text-blue-400",     badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  Emergency:           { bg: "bg-red-100 dark:bg-red-900/50",       text: "text-red-600 dark:text-red-400",       badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  Pediatrics:          { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  Psychiatry:          { bg: "bg-indigo-100 dark:bg-indigo-900/50", text: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" },
  Orthopedics:         { bg: "bg-slate-100 dark:bg-slate-800/60",   text: "text-slate-600 dark:text-slate-400",   badge: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400" },
  Dermatology:         { bg: "bg-yellow-100 dark:bg-yellow-900/50", text: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  Endocrinology:       { bg: "bg-amber-100 dark:bg-amber-900/50",   text: "text-amber-600 dark:text-amber-400",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  Urology:             { bg: "bg-cyan-100 dark:bg-cyan-900/50",     text: "text-cyan-600 dark:text-cyan-400",     badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400" },
  "Infectious Disease":{ bg: "bg-green-100 dark:bg-green-900/50",   text: "text-green-600 dark:text-green-400",   badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
}

const DEFAULT_COLOR = { bg: "bg-primary/10", text: "text-primary", badge: "bg-primary/10 text-primary" }

function getColor(specialty: string) {
  return SPECIALTY_COLORS[specialty] ?? DEFAULT_COLOR
}

// Derive initials from "Dr. Jane Smith" → "JS"
function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")
}

// ── Single doctor card ────────────────────────────────────────────────────
const CARD_SPRING = { type: "spring", stiffness: 280, damping: 24, mass: 0.8 } as const

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const color = getColor(doctor.specialty)
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const isAvailableToday = doctor.available_days.includes(todayName)
  const bookHref = `/book?specialty=${encodeURIComponent(doctor.specialty)}`

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={CARD_SPRING}
      className="h-full"
    >
      <Card className="h-full flex flex-col border border-border/50 shadow-sm hover:shadow-lg hover:border-border transition-shadow duration-300 overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-5 flex-1">
          {/* Avatar + name */}
          <div className="flex items-start gap-3.5">
            <span className={cn(
              "shrink-0 grid place-items-center rounded-2xl font-semibold text-base select-none",
              "size-14",
              color.bg,
              color.text,
            )}>
              {initials(doctor.full_name)}
            </span>
            <div className="min-w-0 flex flex-col gap-0.5 pt-0.5">
              <h3 className="font-semibold text-sm leading-snug truncate">{doctor.full_name}</h3>
              <span className={cn(
                "inline-block text-[11px] font-medium px-2 py-0.5 rounded-full w-fit",
                color.badge,
              )}>
                {doctor.specialty}
              </span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1">
            {doctor.bio ?? `Specialist in ${doctor.specialty} with a focus on patient-centred care and evidence-based treatment.`}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {/* Availability today */}
            <span className="flex items-center gap-1">
              <span className={cn(
                "size-1.5 rounded-full",
                isAvailableToday ? "bg-emerald-500" : "bg-amber-400",
              )} />
              {isAvailableToday ? "Available today" : "Next available"}
            </span>
            {/* Days count */}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="size-3" />
              {doctor.available_days.length}d/wk
            </span>
          </div>

          {/* Available days chips */}
          <div className="flex flex-wrap gap-1">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((short, i) => {
              const full = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][i]
              const active = doctor.available_days.includes(full)
              return (
                <span
                  key={short}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground/50",
                  )}
                >
                  {short}
                </span>
              )
            })}
          </div>

          {/* CTA */}
          <Link
            href={bookHref}
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full gap-1.5 mt-auto",
            )}
          >
            <CalendarCheck className="size-3.5" />
            Book Appointment
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-muted">
        <CalendarCheck className="size-8 text-muted-foreground/50" />
      </span>
      <p className="font-medium text-foreground">No doctors listed yet</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Our team is being set up. Check back soon or contact us directly.
      </p>
    </div>
  )
}

// ── Section (receives pre-fetched data from the server component) ─────────
const STAGGER = {
  hidden:  {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.07 } },
}
const ITEM = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
}

export function DoctorsSectionClient({ doctors }: { doctors: Doctor[] }) {
  const prefersReduced = useReducedMotion()

  return (
    <section aria-labelledby="doctors-heading" className="w-full px-4 sm:px-6 py-20">
      {/* Header */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h2 id="doctors-heading" className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Meet Our Doctors
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg text-balance">
          Experienced healthcare professionals across multiple specialties.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={prefersReduced ? {} : STAGGER}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto"
      >
        {doctors.length === 0 ? (
          <EmptyState />
        ) : (
          doctors.map((doc) => (
            <motion.div key={doc.id} variants={prefersReduced ? {} : ITEM} className="h-full">
              <DoctorCard doctor={doc} />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* View All CTA */}
      {doctors.length > 0 && (
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <Link
            href="/book"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 px-8")}
          >
            View All Doctors
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      )}
    </section>
  )
}
