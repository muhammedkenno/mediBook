"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowRight, Brain, FileCode2 } from "lucide-react"
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StaggerContainer, StaggerItem } from "@/components/motion/primitives"
import { useMousePosition } from "@/components/motion/use-mouse"
import { cn } from "@/lib/utils"

// ── Floating colour orb ───────────────────────────────────────────────────
function FloatingOrb({
  className, x, y, speed,
}: {
  className: string
  x: MotionValue<number>
  y: MotionValue<number>
  speed: number
}) {
  const ox = useTransform(x, (v) => v * speed - 50 * speed)
  const oy = useTransform(y, (v) => v * speed - 50 * speed)
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ x: ox, y: oy }}
    />
  )
}

// ── Glassmorphism AI-model HUD card ───────────────────────────────────────
// Drifts subtly with the cursor; purely decorative; hidden on mobile.
function FloatingHUD({
  x, y, speed, side, icon: Icon, filename, label, visual,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
  speed: number
  side: "left" | "right"
  icon: typeof Brain
  filename: string
  label: string
  visual: React.ReactNode
}) {
  const ox = useTransform(x, (v) => v * speed - 50 * speed)
  const oy = useTransform(y, (v) => v * speed - 50 * speed)

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: ox, y: oy }}
      initial={{ opacity: 0, scale: 0.88, x: side === "left" ? -20 : 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-none hidden lg:flex absolute top-1/2 -translate-y-1/2",
        side === "left" ? "left-6 xl:left-12" : "right-6 xl:right-12",
      )}
    >
      {/* Glass card */}
      <div className={cn(
        "w-52 xl:w-56 flex flex-col gap-3 p-4 select-none",
        "rounded-2xl",
        // glassmorphism
        "bg-white/[0.04] dark:bg-white/[0.03]",
        "border border-white/[0.10] dark:border-white/[0.07]",
        "backdrop-blur-md",
        // low opacity — purely decorative
        "opacity-30",
      )}>
        {/* Header row */}
        <div className="flex items-start gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary">
            <Icon className="size-4" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex flex-col gap-0.5">
            <p className="font-mono text-[10px] leading-tight text-foreground/70 truncate">
              {filename}
            </p>
            <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider">
              {label}
            </p>
          </div>
        </div>

        {/* Data visual */}
        <div className="text-foreground/40">
          {visual}
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 uppercase tracking-wider">
          <span className="size-1.5 rounded-full bg-emerald-500/60" />
          Active · scikit-learn
        </div>
      </div>
    </motion.div>
  )
}

// SVG waveform — mimics a probability distribution / confidence curve
function WaveVisual() {
  return (
    <svg
      viewBox="0 0 200 36"
      fill="none"
      className="w-full h-9"
      aria-hidden
    >
      <path
        d="M0 28 C15 28 18 10 32 10 C46 10 50 22 64 18 C78 14 82 4 96 4 C110 4 114 18 128 18 C142 18 146 10 160 12 C174 14 178 8 192 10 L200 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Confidence fill */}
      <path
        d="M0 28 C15 28 18 10 32 10 C46 10 50 22 64 18 C78 14 82 4 96 4 C110 4 114 18 128 18 C142 18 146 10 160 12 C174 14 178 8 192 10 L200 10 L200 36 L0 36 Z"
        fill="currentColor"
        fillOpacity={0.08}
      />
    </svg>
  )
}

// Bar chart — mimics specialty probability bars
function BarVisual() {
  const bars = [55, 82, 40, 68, 91, 48, 74]
  return (
    <div className="flex items-end gap-1 h-9 w-full" aria-hidden>
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-current"
          style={{ height: `${h}%`, opacity: 0.5 + (h / 100) * 0.4 }}
        />
      ))}
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────
export function HeroSection() {
  const t = useTranslations("landing")
  const prefersReduced = useReducedMotion()
  const { x, y } = useMousePosition()

  // Slow-spring the raw cursor → smooth parallax
  const cfg = { stiffness: 50, damping: 18, mass: 1 }
  const sx = useSpring(x, cfg)
  const sy = useSpring(y, cfg)

  // Dynamic radial gradient that follows the cursor
  const spotX = useTransform(sx, (v) => `${44 + v * 0.008}%`)
  const spotY = useTransform(sy, (v) => `${-10 + v * 0.006}%`)

  return (
    <section
      className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32 overflow-hidden"
      aria-label="Hero"
    >
      {/* ── Gradient backdrop ─────────────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={
          prefersReduced
            ? { background: "radial-gradient(60% 50% at 50% 0%, oklch(0.72 0.12 215 / 0.18), transparent)" }
            : {
                background: useTransform(
                  [spotX, spotY],
                  ([bx, by]: string[]) =>
                    `radial-gradient(65% 55% at ${bx} ${by}, oklch(0.72 0.12 215 / 0.22), transparent)`,
                ),
              }
        }
      />

      {/* ── Colour orbs ───────────────────────────────────────────────── */}
      {!prefersReduced && (
        <>
          <FloatingOrb x={sx} y={sy} speed={0.015}
            className="size-72 -top-16 -start-20 bg-primary/8 dark:bg-primary/6" />
          <FloatingOrb x={sx} y={sy} speed={0.022}
            className="size-56 top-1/3 -end-10 bg-violet-400/6 dark:bg-violet-600/4" />
          <FloatingOrb x={sx} y={sy} speed={0.01}
            className="size-48 bottom-0 start-1/4 bg-sky-400/8 dark:bg-sky-600/5" />
        </>
      )}

      {/* ── AI model HUD cards ────────────────────────────────────────── */}
      <FloatingHUD
        x={sx} y={sy} speed={0.008} side="left"
        icon={Brain}
        filename="final_disease_model.pkl"
        label="Disease Prediction · ML"
        visual={<WaveVisual />}
      />
      <FloatingHUD
        x={sx} y={sy} speed={0.012} side="right"
        icon={FileCode2}
        filename="final_specialty_model.pkl"
        label="Specialty Routing · ML"
        visual={<BarVisual />}
      />

      {/* ── Main content ──────────────────────────────────────────────── */}
      <StaggerContainer
        className="flex flex-col items-center gap-5 relative z-10"
        delayChildren={0.05}
        staggerChildren={0.11}
      >
        <StaggerItem y={16}>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {t("badge")}
          </Badge>
        </StaggerItem>

        <StaggerItem y={24}>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1] text-balance">
            {t("title")}
          </h1>
        </StaggerItem>

        <StaggerItem y={20}>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl text-balance">
            {t("subtitle")}
          </p>
        </StaggerItem>

        <StaggerItem y={16}>
          <div className="flex gap-3 flex-wrap justify-center pt-1">
            <motion.div
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
            >
              <Link
                href="/check-symptoms"
                className={cn(buttonVariants({ size: "lg" }), "px-8 gap-2 group")}
              >
                {t("checkSymptoms")}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
            >
              <Link
                href="/book"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8")}
              >
                {t("browseDoctors")}
              </Link>
            </motion.div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </section>
  )
}
