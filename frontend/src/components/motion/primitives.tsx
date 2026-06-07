"use client"

import { motion, type Variants, type HTMLMotionProps } from "motion/react"

// ─── shared spring ───────────────────────────────────────────────────────────
const spring = { type: "spring", stiffness: 320, damping: 28, mass: 0.8 } as const

// ─── PageEnter ───────────────────────────────────────────────────────────────
// Wraps a whole page; fades + slides up on mount.
const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
}

export function PageEnter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── StaggerContainer ────────────────────────────────────────────────────────
// Parent that staggers its <StaggerItem> children in sequence.
export function StaggerContainer({
  children,
  className,
  delayChildren = 0.1,
  staggerChildren = 0.1,
}: {
  children: React.ReactNode
  className?: string
  delayChildren?: number
  staggerChildren?: number
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden:  {},
        visible: { transition: { delayChildren, staggerChildren } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── StaggerItem ─────────────────────────────────────────────────────────────
// Each child inside a <StaggerContainer> or <StaggerViewport>.
export function StaggerItem({
  children,
  className,
  y = 24,
}: {
  children: React.ReactNode
  className?: string
  y?: number
}) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { ...spring } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ScrollReveal ─────────────────────────────────────────────────────────────
// Fades + slides up when it enters the viewport (once).
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── MotionCard ───────────────────────────────────────────────────────────────
// Drop-in wrapper for any card — adds hover lift + subtle scale.
export function MotionCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.18)" }}
      whileTap={{ scale: 0.985 }}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── FadeIn ───────────────────────────────────────────────────────────────────
// Simple fade — for result cards, modals, toasts.
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.35,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ScaleIn ─────────────────────────────────────────────────────────────────
// Pop-in for confirmation cards, badges, result highlights.
export function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── MotionButton ─────────────────────────────────────────────────────────────
// Wraps any interactive element with a press-spring.
export function MotionPressable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.93 }}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  )
}
