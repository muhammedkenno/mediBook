"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  ShieldCheck, LayoutDashboard, CalendarDays,
  Stethoscope, BarChart3, LogOut, Menu, X,
  ChevronDown, Bell,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Nav items ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",    href: "/admin/dashboard",    icon: LayoutDashboard },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { label: "Doctors",      href: "/admin/doctors",      icon: Stethoscope },
  { label: "Analytics",    href: "/admin/analytics",    icon: BarChart3 },
] as const

// Derive "JD" from "Dr. Jane Doe"
function avatarInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/)
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")
  }
  return (email?.[0] ?? "A").toUpperCase()
}

// ── User dropdown ─────────────────────────────────────────────────────────
function UserMenu({
  displayName,
  email,
  signOutLabel,
}: {
  displayName: string | null
  email: string | null
  signOutLabel: string
}) {
  const [open, setOpen] = useState(false)
  const initials = avatarInitials(displayName, email)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-user-menu]")) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div data-user-menu className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {/* Avatar */}
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold select-none">
          {initials}
        </span>
        <div className="hidden lg:flex flex-col items-start leading-tight">
          <span className="text-xs font-medium max-w-[12ch] truncate">
            {displayName ?? email ?? "Admin"}
          </span>
          <span className="text-[10px] text-muted-foreground">Administrator</span>
        </div>
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute end-0 mt-2 w-52 z-50",
              "rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/10",
              "overflow-hidden",
            )}
          >
            {/* Account header */}
            <div className="px-3.5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{displayName ?? "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0 h-4">
                Admin
              </Badge>
            </div>

            {/* Sign out */}
            <form action="/api/auth/signout" method="post" className="p-1">
              <button
                type="submit"
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left",
                  "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                )}
              >
                <LogOut className="size-3.5 rtl:rotate-180" />
                {signOutLabel}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
interface AdminNavbarClientProps {
  displayName: string | null
  email: string | null
  signOutLabel: string
  notificationSlot: React.ReactNode
  languageSlot: React.ReactNode
}

export function AdminNavbarClient({
  displayName, email, signOutLabel, notificationSlot, languageSlot,
}: AdminNavbarClientProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const prefersReduced = useReducedMotion()

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Close drawer on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return (
    <motion.nav
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        "border-b",
        scrolled
          ? "border-border/60 bg-background/90 backdrop-blur-xl shadow-sm shadow-black/5"
          : "border-border/40 bg-background/70 backdrop-blur-md",
      )}
      initial={prefersReduced ? {} : { y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* ── Brand ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <motion.span
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"
            >
              <ShieldCheck className="size-3.5" />
            </motion.span>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">MediBook</span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-semibold tracking-wide">
                ADMIN
              </Badge>
            </div>
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  {/* Active background pill — shared layout animation */}
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className={cn("relative size-3.5 shrink-0", isActive ? "text-primary" : "")} />
                  <span className="relative">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── Right side ────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <span className="hidden sm:flex">{notificationSlot}</span>

          {/* Language + Theme (desktop) */}
          <div className="hidden md:flex items-center gap-1.5">
            {languageSlot}
            <ThemeToggle />
          </div>

          {/* Separator */}
          <div className="hidden md:block w-px h-5 bg-border mx-1" />

          {/* User menu (desktop) */}
          <div className="hidden md:flex">
            <UserMenu displayName={displayName} email={email} signOutLabel={signOutLabel} />
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <motion.button
              onClick={() => setMobileOpen((v) => !v)}
              whileTap={{ scale: 0.92 }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className={cn(
                "size-9 grid place-items-center rounded-lg border border-border/50",
                "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x"
                    initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.12 }}
                  >
                    <X className="size-4" />
                  </motion.span>
                ) : (
                  <motion.span key="menu"
                    initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.12 }}
                  >
                    <Menu className="size-4" />
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
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {/* Nav links */}
              {NAV_ITEMS.map(({ label, href, icon: Icon }, i) => {
                const isActive = pathname === href || pathname.startsWith(href + "/")
                return (
                  <motion.div
                    key={href}
                    initial={prefersReduced ? {} : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {label}
                      {isActive && (
                        <span className="ml-auto size-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </motion.div>
                )
              })}

              <div className="my-2 h-px bg-border" />

              {/* Bottom controls */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {notificationSlot}
                  {languageSlot}
                </div>
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    {signOutLabel}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
