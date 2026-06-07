"use client"

import { motion, useMotionTemplate, useReducedMotion, useSpring } from "motion/react"
import { useMousePosition } from "./use-mouse"

/**
 * Subtle radial spotlight that follows the cursor at page level.
 * Pointer-events-none so it never blocks interaction.
 * Respects prefers-reduced-motion.
 */
export function MouseSpotlight() {
  const prefersReduced = useReducedMotion()
  const { x, y } = useMousePosition()

  // Very slow spring = smooth, lags nicely behind cursor
  const cfg = { stiffness: 55, damping: 22, mass: 1.2 }
  const sx = useSpring(x, cfg)
  const sy = useSpring(y, cfg)

  const bg = useMotionTemplate`radial-gradient(700px circle at ${sx}px ${sy}px, rgba(99,102,241,0.06), transparent 40%)`

  if (prefersReduced) return null

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ background: bg }}
    />
  )
}
