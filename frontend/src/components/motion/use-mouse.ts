"use client"

import { useEffect } from "react"
import { useMotionValue, useSpring, useReducedMotion } from "motion/react"
import type { MotionValue } from "motion/react"

// ── Global cursor position ─────────────────────────────────────────────────
// Returns raw MotionValues (no re-renders on move).
export function useMousePosition(): { x: MotionValue<number>; y: MotionValue<number> } {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener("mousemove", move, { passive: true })
    return () => window.removeEventListener("mousemove", move)
  }, [x, y, prefersReduced])

  return { x, y }
}

// ── Card-level 3-D tilt ────────────────────────────────────────────────────
// Returns spring-smoothed rotateX/Y and raw glow cursor %, plus event handlers.
export function useCardTilt(maxDeg = 7) {
  const prefersReduced = useReducedMotion()

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glowX   = useMotionValue(50)  // % inside card
  const glowY   = useMotionValue(50)

  const cfg = { stiffness: 280, damping: 26, mass: 0.5 }
  const springRotX = useSpring(rotateX, cfg)
  const springRotY = useSpring(rotateY, cfg)

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (prefersReduced) return
    const r = e.currentTarget.getBoundingClientRect()
    const xPct = (e.clientX - r.left) / r.width   // 0‥1
    const yPct = (e.clientY - r.top)  / r.height
    rotateY.set((xPct - 0.5) * maxDeg * 2)
    rotateX.set((yPct - 0.5) * -maxDeg * 2)
    glowX.set(xPct * 100)
    glowY.set(yPct * 100)
  }

  function onMouseLeave() {
    rotateX.set(0); rotateY.set(0)
    glowX.set(50); glowY.set(50)
  }

  return { springRotX, springRotY, glowX, glowY, onMouseMove, onMouseLeave }
}
