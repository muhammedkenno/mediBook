"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  Stethoscope, LogOut, Menu, X, AlertTriangle,
  Phone, ChevronRight, CalendarDays, User,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Section nav links ─────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",        href: "#home" },
  { label: "Specialties", href: "#specialties" },
  { label: "Our Doctors", href: "#doctors" },
  { label: "How It Works",href: "#how-it-works" },
  { label: "Contact",     href: "#contact" },
] as const

// ── Smooth scroll helper ──────────────────────────────────────────────────
function scrollToSection(id: string) {
  const el = document.getElementById(id.replace("#", ""))
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  } else {
    // fallback for non-landing pages — navigate home with hash
    window.location.href = `/${id}`
  }
}

// ── Emergency Modal ───────────────────────────────────────────────────────
function EmergencyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prefersReduced = useReducedMotion()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-title"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? {} : { opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="relative w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
              {/* Red top accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-rose-500" />

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 end-4 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="p-6 flex flex-col gap-5">
                {/* Icon + title */}
                <div className="flex items-start gap-4">
                  <span className="shrink-0 grid size-12 place-items-center rounded-xl bg-red-100 dark:bg-red-900/40">
                    <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
                  </span>
                  <div>
                    <h2 id="emergency-title" className="font-bold text-lg text-red-700 dark:text-red-400">
                      Medical Emergency
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Do not wait — act immediately.
                    </p>
                  </div>
                </div>

                {/* Body */}
                <p className="text-sm leading-relaxed text-foreground">
                  If you or someone nearby is experiencing{" "}
                  <strong>chest pain, stroke symptoms, severe bleeding, difficulty breathing,
                  loss of consciousness</strong>, or any other life-threatening condition —
                  call emergency services <strong>immediately</strong> and do not wait for an
                  appointment.
                </p>

                {/* Call buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="tel:911"
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 transition-colors text-sm"
                  >
                    <Phone className="size-4" />
                    Call 911
                  </a>
                  <a
                    href="tel:+18009110000"
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-3 px-4 transition-colors text-sm"
                  >
                    <Phone className="size-4" />
                    +1 800 911-0000
                  </a>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Emergency lines are available 24 / 7
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Emergency button ──────────────────────────────────────────────────────
function EmergencyButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className={cn(
        "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5",
        "text-xs font-semibold text-white",
        "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
        "shadow-[0_0_0_3px_rgba(220,38,38,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
        "transition-colors",
      )}
      aria-label="Emergency — open emergency information"
    >
      {/* Pulse ring */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25 dark:opacity-20"
      />
      <AlertTriangle className="relative size-3.5" />
      <span className="relative">Emergency</span>
    </motion.button>
  )
}

// ── Main NavbarClient ─────────────────────────────────────────────────────
interface NavbarClientProps {
  displayName: string | null
  isAdmin: boolean
  isLoggedIn: boolean
  brandLabel: string
  signInLabel: string
  getStartedLabel: string
  dashboardLabel: string
  appointmentsLabel: string
  profileLabel: string
  signOutLabel: string
  welcomeLabel: string
  extraLink?: React.ReactNode
  notificationSlot?: React.ReactNode
  languageSlot?: React.ReactNode
}

export function NavbarClient({
  displayName, isAdmin, isLoggedIn,
  brandLabel, signInLabel, getStartedLabel, dashboardLabel,
  appointmentsLabel, profileLabel, signOutLabel, welcomeLabel,
  extraLink, notificationSlot, languageSlot,
}: NavbarClientProps) {
  const pathname = usePathname()
  const isLanding = pathname === "/"

  const router = useRouter()
  const [scrolled, setScrolled]       = useState(false)
  const [activeSection, setActive]    = useState<string>("home")
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [emergencyOpen, setEmergency] = useState(false)
  const prefersReduced = useReducedMotion()

  // ── Scroll shadow ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // ── Active section via IntersectionObserver ──────────────────────────
  useEffect(() => {
    if (!isLanding) return
    const ids = NAV_LINKS.map((l) => l.href.replace("#", ""))
    const observers: IntersectionObserver[] = []
    const visible = new Set<string>()

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
          // pick the first visible section in document order
          const first = ids.find((i) => visible.has(i))
          if (first) setActive(first)
        },
        { threshold: 0.25, rootMargin: "-64px 0px 0px 0px" },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [isLanding])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false)
    if (isLanding) {
      scrollToSection(href)
    } else {
      // Navigate to the home page with the section hash — browser scrolls automatically
      router.push(`/${href}`)
    }
  }, [isLanding, router])

  return (
    <>
      <EmergencyModal open={emergencyOpen} onClose={() => setEmergency(false)} />

      <motion.nav
        className={cn(
          "sticky top-0 z-40 w-full",
          "border-b transition-all duration-300",
          scrolled
            ? "border-border/60 bg-background/85 backdrop-blur-xl shadow-sm shadow-black/5"
            : "border-transparent bg-background/60 backdrop-blur-md",
        )}
        initial={prefersReduced ? {} : { y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <motion.span
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 360, damping: 18 }}
              className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
            >
              <Stethoscope className="size-4" />
            </motion.span>
            <span className="hidden sm:inline tracking-tight">{brandLabel}</span>
          </Link>

          {/* ── Desktop nav links ─────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, href }) => {
              const sectionId = href.replace("#", "")
              const isActive = isLanding && activeSection === sectionId
              return (
                <button
                  key={href}
                  onClick={() => handleNavClick(href)}
                  className={cn(
                    "relative px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {label}
                  {/* Active underline pill */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Right side controls ───────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Emergency — always visible */}
            <EmergencyButton onClick={() => setEmergency(true)} />

            {/* Desktop-only auth + utilities */}
            <div className="hidden md:flex items-center gap-2">
              {extraLink}
              {isLoggedIn ? (
                <>
                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      {dashboardLabel}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/appointments"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                      >
                        <CalendarDays className="size-4" />
                        <span className="hidden lg:inline">{appointmentsLabel}</span>
                      </Link>
                      <Link
                        href="/profile"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                      >
                        <User className="size-4" />
                        <span className="hidden lg:inline">{profileLabel}</span>
                      </Link>
                    </>
                  )}
                  <span className="text-sm text-muted-foreground max-w-[13ch] truncate hidden lg:inline">
                    {welcomeLabel}
                  </span>
                  {notificationSlot}
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                      aria-label={signOutLabel}
                    >
                      <LogOut className="size-4 rtl:rotate-180" />
                      <span className="hidden lg:inline">{signOutLabel}</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                    {signInLabel}
                  </Link>
                  <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                    {getStartedLabel}
                  </Link>
                </>
              )}
              <div className="w-px h-5 bg-border" />
              {languageSlot}
              <ThemeToggle />
            </div>

            {/* Mobile: notifications if logged in + hamburger */}
            {isLoggedIn && (
              <span className="md:hidden">
                {notificationSlot}
              </span>
            )}
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />
              <motion.button
                onClick={() => setMobileOpen((v) => !v)}
                whileTap={{ scale: 0.92 }}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "size-9 p-0",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span key="x"
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 45, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu"
                      initial={{ rotate: 45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -45, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="size-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Mobile drawer ──────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-drawer"
              initial={prefersReduced ? {} : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={prefersReduced ? {} : { height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {/* Section links */}
                {NAV_LINKS.map(({ label, href }, i) => {
                  const sectionId = href.replace("#", "")
                  const isActive = isLanding && activeSection === sectionId
                  return (
                    <motion.button
                      key={href}
                      onClick={() => handleNavClick(href)}
                      initial={prefersReduced ? {} : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {label}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </motion.button>
                  )
                })}

                {/* Divider */}
                <div className="my-2 h-px bg-border" />

                {/* Language switcher */}
                <div className="flex items-center gap-2 px-3 py-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Language</span>
                  {languageSlot}
                </div>

                {/* Auth actions */}
                <div className="mt-1 flex flex-col gap-1">
                  {isLoggedIn ? (
                    <>
                      {isAdmin ? (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}
                        >
                          {dashboardLabel}
                        </Link>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/appointments"
                            onClick={() => setMobileOpen(false)}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 justify-center")}
                          >
                            <CalendarDays className="size-4" />
                            {appointmentsLabel}
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setMobileOpen(false)}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 justify-center")}
                          >
                            <User className="size-4" />
                            {profileLabel}
                          </Link>
                        </div>
                      )}
                      <form action="/api/auth/signout" method="post">
                        <button
                          type="submit"
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full gap-1.5 justify-center")}
                        >
                          <LogOut className="size-4" />
                          {signOutLabel}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-center")}
                      >
                        {signInLabel}
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className={cn(buttonVariants({ size: "sm" }), "justify-center")}
                      >
                        {getStartedLabel}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
