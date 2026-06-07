"use client"

import Image from "next/image"
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"
import { useMousePosition } from "@/components/motion/use-mouse"

export function DoctorsIllustration() {
  const prefersReduced = useReducedMotion()
  const { x, y } = useMousePosition()

  // Very slow spring so the parallax feels like a gentle drift
  const cfg = { stiffness: 28, damping: 22, mass: 1.8 }
  const sx = useSpring(x, cfg)
  const sy = useSpring(y, cfg)

  // Small parallax offset — image barely follows the cursor
  const ox = useTransform(sx, (v) => v * 0.006 - 50 * 0.006)
  const oy = useTransform(sy, (v) => v * 0.004 - 50 * 0.004)

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none select-none"
      style={prefersReduced ? {} : { x: ox, y: oy }}
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      {/* Slow float */}
      <motion.div
        animate={prefersReduced ? {} : { y: [0, -16, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/doctors-team.png"
          alt=""
          width={1000}
          height={667}
          priority
          className={[
            // Responsive sizing
            "w-[300px] sm:w-[440px] md:w-[580px] lg:w-[760px] xl:w-[900px]",
            // Opacity — light / dark
            "opacity-[0.20] dark:opacity-[0.18]",
            // Blend: multiply removes the white bg on light, invert+screen on dark
            "mix-blend-multiply dark:mix-blend-normal dark:invert",
            // Very slight blur to soften hard edges
            "blur-[0.6px]",
            // Scale to fill the zone
            "scale-105",
          ].join(" ")}
          style={{
            // Radial gradient mask fades all four edges so it dissolves into bg
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 55%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 55%, black 40%, transparent 100%)",
          }}
        />
      </motion.div>
    </motion.div>
  )
}
