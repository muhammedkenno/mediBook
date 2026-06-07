"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react"
import {
  Heart, Brain, Wind, FlaskConical, Eye, Ear,
  Stethoscope, Zap, Baby, HeartHandshake,
  Activity, Fingerprint, ArrowRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useCardTilt } from "@/components/motion/use-mouse"

// ── Data ──────────────────────────────────────────────────────────────────
interface Specialty {
  slug: string
  name: string
  description: string
  icon: LucideIcon
  gradient: string
  iconBg: string
  iconColor: string
  hoverBorder: string
  hoverShadow: string
}

const SPECIALTIES: Specialty[] = [
  {
    slug: "Cardiology", name: "Cardiology",
    description: "Heart & cardiovascular system disorders",
    icon: Heart,
    gradient:    "bg-gradient-to-br from-red-50 to-rose-100/60 dark:from-red-950/40 dark:to-rose-900/20",
    iconBg:      "bg-red-100 dark:bg-red-900/50", iconColor: "text-red-600 dark:text-red-400",
    hoverBorder: "hover:border-red-300 dark:hover:border-red-700",
    hoverShadow: "hover:shadow-red-100/80 dark:hover:shadow-red-950/50",
  },
  {
    slug: "Neurology", name: "Neurology",
    description: "Brain, spinal cord & nervous system conditions",
    icon: Brain,
    gradient:    "bg-gradient-to-br from-purple-50 to-violet-100/60 dark:from-purple-950/40 dark:to-violet-900/20",
    iconBg:      "bg-purple-100 dark:bg-purple-900/50", iconColor: "text-purple-600 dark:text-purple-400",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700",
    hoverShadow: "hover:shadow-purple-100/80 dark:hover:shadow-purple-950/50",
  },
  {
    slug: "Respiratory", name: "Respiratory Medicine",
    description: "Lungs, breathing disorders & pulmonary conditions",
    icon: Wind,
    gradient:    "bg-gradient-to-br from-sky-50 to-cyan-100/60 dark:from-sky-950/40 dark:to-cyan-900/20",
    iconBg:      "bg-sky-100 dark:bg-sky-900/50", iconColor: "text-sky-600 dark:text-sky-400",
    hoverBorder: "hover:border-sky-300 dark:hover:border-sky-700",
    hoverShadow: "hover:shadow-sky-100/80 dark:hover:shadow-sky-950/50",
  },
  {
    slug: "Gastroenterology", name: "Gastroenterology",
    description: "Digestive system, gut & related organ disorders",
    icon: FlaskConical,
    gradient:    "bg-gradient-to-br from-orange-50 to-amber-100/60 dark:from-orange-950/40 dark:to-amber-900/20",
    iconBg:      "bg-orange-100 dark:bg-orange-900/50", iconColor: "text-orange-600 dark:text-orange-400",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700",
    hoverShadow: "hover:shadow-orange-100/80 dark:hover:shadow-orange-950/50",
  },
  {
    slug: "Ophthalmology", name: "Ophthalmology",
    description: "Eye conditions, vision care & ocular surgery",
    icon: Eye,
    gradient:    "bg-gradient-to-br from-teal-50 to-emerald-100/60 dark:from-teal-950/40 dark:to-emerald-900/20",
    iconBg:      "bg-teal-100 dark:bg-teal-900/50", iconColor: "text-teal-600 dark:text-teal-400",
    hoverBorder: "hover:border-teal-300 dark:hover:border-teal-700",
    hoverShadow: "hover:shadow-teal-100/80 dark:hover:shadow-teal-950/50",
  },
  {
    slug: "ENT", name: "ENT",
    description: "Ear, nose & throat disorders and treatments",
    icon: Ear,
    gradient:    "bg-gradient-to-br from-rose-50 to-pink-100/60 dark:from-rose-950/40 dark:to-pink-900/20",
    iconBg:      "bg-rose-100 dark:bg-rose-900/50", iconColor: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700",
    hoverShadow: "hover:shadow-rose-100/80 dark:hover:shadow-rose-950/50",
  },
  {
    slug: "General Practice", name: "General Medicine",
    description: "Comprehensive primary care & routine health checks",
    icon: Stethoscope,
    gradient:    "bg-gradient-to-br from-blue-50 to-indigo-100/60 dark:from-blue-950/40 dark:to-indigo-900/20",
    iconBg:      "bg-blue-100 dark:bg-blue-900/50", iconColor: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
    hoverShadow: "hover:shadow-blue-100/80 dark:hover:shadow-blue-950/50",
  },
  {
    slug: "Emergency", name: "Emergency Medicine",
    description: "Urgent & critical care for acute medical conditions",
    icon: Zap,
    gradient:    "bg-gradient-to-br from-red-50 to-orange-100/60 dark:from-red-950/40 dark:to-orange-900/20",
    iconBg:      "bg-red-100 dark:bg-red-900/50", iconColor: "text-red-600 dark:text-red-400",
    hoverBorder: "hover:border-red-400 dark:hover:border-red-600",
    hoverShadow: "hover:shadow-red-100/80 dark:hover:shadow-red-950/50",
  },
  {
    slug: "Pediatrics", name: "Pediatrics",
    description: "Specialised healthcare for infants, children & adolescents",
    icon: Baby,
    gradient:    "bg-gradient-to-br from-emerald-50 to-green-100/60 dark:from-emerald-950/40 dark:to-green-900/20",
    iconBg:      "bg-emerald-100 dark:bg-emerald-900/50", iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    hoverShadow: "hover:shadow-emerald-100/80 dark:hover:shadow-emerald-950/50",
  },
  {
    slug: "Psychiatry", name: "Psychiatry",
    description: "Mental health, behavioural & emotional wellbeing care",
    icon: HeartHandshake,
    gradient:    "bg-gradient-to-br from-indigo-50 to-violet-100/60 dark:from-indigo-950/40 dark:to-violet-900/20",
    iconBg:      "bg-indigo-100 dark:bg-indigo-900/50", iconColor: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
    hoverShadow: "hover:shadow-indigo-100/80 dark:hover:shadow-indigo-950/50",
  },
  {
    slug: "Orthopedics", name: "Orthopedics",
    description: "Bones, joints, muscles, ligaments & sports injuries",
    icon: Activity,
    gradient:    "bg-gradient-to-br from-slate-50 to-gray-100/60 dark:from-slate-900/40 dark:to-gray-900/20",
    iconBg:      "bg-slate-100 dark:bg-slate-800/60", iconColor: "text-slate-600 dark:text-slate-400",
    hoverBorder: "hover:border-slate-300 dark:hover:border-slate-600",
    hoverShadow: "hover:shadow-slate-100/80 dark:hover:shadow-slate-950/50",
  },
  {
    slug: "Dermatology", name: "Dermatology",
    description: "Skin, hair & nail conditions and cosmetic treatments",
    icon: Fingerprint,
    gradient:    "bg-gradient-to-br from-yellow-50 to-amber-100/60 dark:from-yellow-950/40 dark:to-amber-900/20",
    iconBg:      "bg-yellow-100 dark:bg-yellow-900/50", iconColor: "text-yellow-600 dark:text-yellow-400",
    hoverBorder: "hover:border-yellow-300 dark:hover:border-yellow-700",
    hoverShadow: "hover:shadow-yellow-100/80 dark:hover:shadow-yellow-950/50",
  },
]

// ── Card spring ───────────────────────────────────────────────────────────
const SPRING = { type: "spring", stiffness: 300, damping: 26, mass: 0.8 } as const

// ── 3D Tilt card with cursor glow ─────────────────────────────────────────
function SpecialtyCard({ spec, bookLabel }: { spec: Specialty; bookLabel: string }) {
  const prefersReduced = useReducedMotion()
  const { springRotX, springRotY, glowX, glowY, onMouseMove, onMouseLeave } = useCardTilt(6)

  // Soft radial glow that follows the cursor inside the card
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.14), transparent 65%)`

  const href = `/book?specialty=${encodeURIComponent(spec.slug)}`

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={prefersReduced ? {} : { scale: 0.97 }}
      transition={SPRING}
      style={
        prefersReduced
          ? {}
          : {
              rotateX: springRotX,
              rotateY: springRotY,
              transformPerspective: 1000,
            }
      }
      className="h-full"
    >
      <Link
        href={href}
        aria-label={`${bookLabel} — ${spec.name}`}
        className={[
          "group relative flex flex-col h-full rounded-2xl border p-5 gap-4",
          "transition-shadow duration-300 cursor-pointer overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          spec.gradient,
          spec.hoverBorder,
          `hover:shadow-xl ${spec.hoverShadow}`,
        ].join(" ")}
      >
        {/* Cursor-reactive glow overlay */}
        {!prefersReduced && (
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: glowBg }}
          />
        )}

        {/* Icon */}
        <span className={[
          "relative grid size-12 place-items-center rounded-xl z-10",
          "transition-transform duration-300 group-hover:scale-110",
          spec.iconBg, spec.iconColor,
        ].join(" ")}>
          <spec.icon className="size-6" strokeWidth={1.75} />
        </span>

        {/* Text */}
        <div className="relative z-10 flex flex-col gap-1.5 flex-1">
          <h3 className="font-semibold text-base leading-tight">{spec.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{spec.description}</p>
        </div>

        {/* CTA */}
        <div className="relative z-10 flex items-center gap-1.5 text-sm font-medium text-primary mt-auto pt-1">
          <span>{bookLabel}</span>
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </div>
      </Link>
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────
export function SpecialtiesSection() {
  const t = useTranslations("landing")
  const prefersReduced = useReducedMotion()

  const staggerVariants = {
    hidden:  {},
    visible: { transition: { delayChildren: 0.05, staggerChildren: prefersReduced ? 0 : 0.06 } },
  }

  const itemVariants = {
    hidden:  { opacity: 0, y: prefersReduced ? 0 : 28 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING } },
  }

  return (
    <section
      aria-labelledby="specialties-heading"
      className="relative w-full px-4 sm:px-6 py-20 overflow-hidden"
    >
      {/* Tinted background stripe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/30 to-transparent"
      />

      {/* Header */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h2
          id="specialties-heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
        >
          {t("specialtiesTitle")}
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg text-balance">
          {t("specialtiesSubtitle")}
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto"
      >
        {SPECIALTIES.map((spec) => (
          <motion.div key={spec.slug} variants={itemVariants}>
            <SpecialtyCard spec={spec} bookLabel={t("bookSpecialty")} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
