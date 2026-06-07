"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useForm } from "react-hook-form"
import {
  MapPin, Phone, Mail, Clock, ShieldAlert,
  Send, CheckCircle2, AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────
interface ContactFormValues {
  name: string
  email: string
  subject: string
  message: string
}

// ── Contact info data ─────────────────────────────────────────────────────
const INFO_ITEMS = [
  {
    icon: MapPin,
    label: "Address",
    value: "123 Medical Centre Drive, Health City, HC 10001",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) 123-4567",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@medibook.health",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon – Fri: 8 AM – 8 PM\nSat – Sun: 9 AM – 5 PM",
  },
  {
    icon: ShieldAlert,
    label: "Emergency",
    value: "911 or +1 (800) 911-0000 (24 / 7)",
    highlight: true,
  },
]

// ── Contact info card (left column) ───────────────────────────────────────
function ContactInfo() {
  return (
    <Card className="h-full border border-border/50 shadow-sm">
      <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-1">Get in Touch</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Our patient support team is ready to help you with appointments,
            medical enquiries, or any general questions.
          </p>
        </div>

        <ul className="flex flex-col gap-5">
          {INFO_ITEMS.map(({ icon: Icon, label, value, highlight }) => (
            <li key={label} className="flex items-start gap-3.5">
              <span className={cn(
                "shrink-0 grid size-9 place-items-center rounded-xl mt-0.5",
                highlight
                  ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                  : "bg-primary/10 text-primary",
              )}>
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {label}
                </span>
                <span className={cn(
                  "text-sm whitespace-pre-line leading-relaxed",
                  highlight && "text-red-600 dark:text-red-400 font-medium",
                )}>
                  {value}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// ── Contact form (right column) ───────────────────────────────────────────
type FormStatus = "idle" | "loading" | "success" | "error"

function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>()

  async function onSubmit(data: ContactFormValues) {
    setStatus("loading")
    try {
      // Simulate network delay — replace with real server action / API call
      await new Promise((res) => setTimeout(res, 1200))
      console.info("Contact form submitted:", data)
      setStatus("success")
      reset()
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <Card className="h-full border border-border/50 shadow-sm">
        <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center gap-4 min-h-[360px] text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
          </span>
          <div>
            <h3 className="font-semibold text-lg mb-1">Message Sent!</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Thank you for reaching out. Our team will get back to you within 24 hours.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
            Send another message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border border-border/50 shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <h3 className="font-semibold text-lg mb-1">Send a Message</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Fill in the form below and we'll respond as soon as possible.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {/* Name + Email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-name">Full Name</Label>
              <Input
                id="contact-name"
                placeholder="Jane Smith"
                aria-invalid={!!errors.name}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email">Email Address</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-subject">Subject</Label>
            <Input
              id="contact-subject"
              placeholder="How can we help you?"
              aria-invalid={!!errors.subject}
              {...register("subject", { required: "Subject is required" })}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-message">Message</Label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="Tell us more about your question or concern…"
              aria-invalid={!!errors.message}
              className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
                "placeholder:text-muted-foreground shadow-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                errors.message && "border-destructive",
              )}
              {...register("message", {
                required: "Message is required",
                minLength: { value: 10, message: "Please write at least 10 characters" },
              })}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Error banner */}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              Something went wrong. Please try again.
            </div>
          )}

          {/* Submit */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
          >
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Send Message
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Section ───────────────────────────────────────────────────────────────
export function ContactSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      aria-labelledby="contact-heading"
      className="w-full px-4 sm:px-6 py-20 relative overflow-hidden"
    >
      {/* Tinted background stripe — mirrors the specialties section */}
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
          id="contact-heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
        >
          Contact Us
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg text-balance">
          Have questions or need assistance? Our team is here to help.
        </p>
      </motion.div>

      {/* Two-column layout */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto"
      >
        <ContactInfo />
        <ContactForm />
      </motion.div>
    </section>
  )
}
