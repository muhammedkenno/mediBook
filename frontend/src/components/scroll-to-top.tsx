"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronUp } from "lucide-react"

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          onClick={scrollTop}
          aria-label="Scroll to top"
          className={[
            "fixed bottom-6 end-6 z-50",
            "grid size-10 place-items-center rounded-full",
            "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
            "hover:bg-primary/90 active:scale-95 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          ].join(" ")}
        >
          <ChevronUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
