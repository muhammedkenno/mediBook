"use client"

import { useEffect, useState, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { DayPicker } from "react-day-picker"
import { ar as arLocale } from "react-day-picker/locale"
import {
  CheckCircle2, CalendarCheck, ArrowLeft, Loader2,
  Clock, Stethoscope, CalendarDays,
} from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { bookAppointment } from "@/lib/actions/appointments"
import type { Doctor } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DoctorGridSkeleton } from "./doctor-skeleton"
import { normalizeSpecialty, specialtyMatches } from "@/lib/specialty"
import { ScaleIn, StaggerContainer, StaggerItem, FadeIn } from "@/components/motion/primitives"

// ── Specialty colour palette (avatar bg / text) ───────────────────────────────
const SPECIALTY_PALETTE: Record<string, { bg: string; text: string }> = {
  "cardiology":         { bg: "bg-red-100    dark:bg-red-900/40",     text: "text-red-700    dark:text-red-300" },
  "neurology":          { bg: "bg-purple-100 dark:bg-purple-900/40",  text: "text-purple-700 dark:text-purple-300" },
  "respiratory":        { bg: "bg-sky-100    dark:bg-sky-900/40",     text: "text-sky-700    dark:text-sky-300" },
  "gastroenterology":   { bg: "bg-orange-100 dark:bg-orange-900/40",  text: "text-orange-700 dark:text-orange-300" },
  "general practice":   { bg: "bg-emerald-100 dark:bg-emerald-900/40",text: "text-emerald-700 dark:text-emerald-300" },
  "dermatology":        { bg: "bg-yellow-100 dark:bg-yellow-900/40",  text: "text-yellow-700 dark:text-yellow-300" },
  "infectious disease": { bg: "bg-teal-100   dark:bg-teal-900/40",    text: "text-teal-700   dark:text-teal-300" },
  "emergency":          { bg: "bg-rose-100   dark:bg-rose-900/40",    text: "text-rose-700   dark:text-rose-300" },
  "orthopedics":        { bg: "bg-slate-100  dark:bg-slate-800/60",   text: "text-slate-700  dark:text-slate-300" },
  "endocrinology":      { bg: "bg-pink-100   dark:bg-pink-900/40",    text: "text-pink-700   dark:text-pink-300" },
}

function specialtyPalette(specialty: string) {
  return SPECIALTY_PALETTE[specialty.toLowerCase()] ?? { bg: "bg-primary/10", text: "text-primary" }
}

function doctorInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase()
}

// ── Day-of-week helpers ────────────────────────────────────────────────────────
const JS_DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

function isAvailableDay(date: Date, availableDays: string[]): boolean {
  return availableDays.includes(JS_DAY_NAMES[date.getDay()])
}

// ── Time slots ─────────────────────────────────────────────────────────────────
const MORNING_SLOTS    = ["09:00","09:30","10:00","10:30","11:00","11:30"]
const AFTERNOON_SLOTS  = ["14:00","14:30","15:00","15:30","16:00","16:30"]

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, labels }: { current: 1 | 2 | 3; labels: [string, string, string] }) {
  return (
    <ol className="flex items-center gap-1.5 text-sm flex-wrap">
      {labels.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3
        const active = step === current
        const done   = step < current
        return (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`grid size-6 place-items-center rounded-full text-xs font-semibold transition-colors ${
              active ? "bg-primary text-primary-foreground"
              : done  ? "bg-primary/20 text-primary"
              :         "bg-muted text-muted-foreground"
            }`}>
              {done ? <CheckCircle2 className="size-3.5" /> : step}
            </span>
            <span className={`text-sm ${active ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
            {step < 3 && <span className="mx-1 h-px w-5 bg-border shrink-0" />}
          </li>
        )
      })}
    </ol>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
type Step = "select-doctor" | "select-datetime" | "done"

export default function BookingClient() {
  const t      = useTranslations("booking")
  const tc     = useTranslations("common")
  const locale = useLocale()
  const searchParams = useSearchParams()
  const router = useRouter()
  const specialty = searchParams.get("specialty") ?? ""

  const [doctors,       setDoctors]       = useState<Doctor[]>([])
  const [filtered,      setFiltered]      = useState<Doctor[]>([])
  const [loadingDoctors,setLoadingDoctors]= useState(true)
  const [search,        setSearch]        = useState(specialty)

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate,   setSelectedDate]   = useState<Date | undefined>(undefined)
  const [time,           setTime]           = useState("")
  const [notes,          setNotes]          = useState("")
  const [step,           setStep]           = useState<Step>("select-doctor")
  const [confirmationId, setConfirmationId] = useState<string | null>(null)
  const [error,          setError]          = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Pass the Arabic DayPicker locale object when the UI is in Arabic so that
  // month names, weekday headers, and ARIA labels are rendered in Arabic.
  const calLocale = locale === "ar" ? arLocale : undefined

  useEffect(() => {
    const supabase = createClient()
    supabase.from("doctors").select("*").order("specialty")
      .then(({ data }) => {
        const list = data ?? []
        setDoctors(list)
        setFiltered(specialty ? list.filter(d => specialtyMatches(d.specialty, specialty)) : list)
        setLoadingDoctors(false)
      })
  }, [specialty])

  useEffect(() => {
    const q = normalizeSpecialty(search)
    setFiltered(
      q ? doctors.filter(d =>
        specialtyMatches(d.specialty, search) || d.full_name.toLowerCase().includes(q)
      ) : doctors
    )
  }, [search, doctors])

  const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : ""

  // Which days to disable: past dates + days not in doctor's schedule
  function isDisabledDay(date: Date): boolean {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (date < today) return true
    if (selectedDoctor && !isAvailableDay(date, selectedDoctor.available_days)) return true
    return false
  }

  async function handleBook() {
    if (!selectedDoctor || !dateStr || !time) return
    setError(null)
    startTransition(async () => {
      try {
        const { id } = await bookAppointment({
          doctorId: selectedDoctor.id,
          appointmentDate: dateStr,
          appointmentTime: time,
          notes: notes || null,
        })
        setConfirmationId(id)
        toast.success(t("bookedToast"))
        setStep("done")
      } catch (err) {
        const raw = err instanceof Error ? err.message : "Something went wrong"
        if (raw.toLowerCase().includes("not authenticated")) {
          router.push("/login?next=/book"); return
        }
        // Translate the slot-taken error; fall back to raw message for anything else.
        const message = raw.includes("time slot has just been taken")
          ? t("slotTaken")
          : raw
        setError(message)
        toast.error(message)
      }
    })
  }

  // ── Step: Done ──────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <ScaleIn>
        <Card className="max-w-md">
          <CardHeader>
            <div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 mb-2">
              <CheckCircle2 className="size-7" />
            </div>
            <CardTitle className="text-xl">{t("confirmedTitle")}</CardTitle>
            <CardDescription className="font-mono text-sm">
              {t("reference", { ref: confirmationId?.slice(0, 8).toUpperCase() ?? "" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* Summary block */}
            <div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-primary shrink-0" />
                <span className="font-medium">{selectedDoctor?.full_name}</span>
                <Badge variant="secondary" className="ms-auto">{selectedDoctor?.specialty}</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" />
                <span>{dateStr}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>{time}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("confirmedBody", { doctor: selectedDoctor?.full_name ?? "", date: dateStr, time })}</p>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => router.push("/appointments")}
                className="gap-1.5"
              >
                <CalendarDays className="size-4" />
                {t("viewMyAppointments")}
              </Button>
              <Button variant="outline" onClick={() => router.push("/check-symptoms")}>
                {t("checkAgain")}
              </Button>
              <Button onClick={() => {
                setStep("select-doctor")
                setSelectedDoctor(null)
                setSelectedDate(undefined)
                setTime("")
              }}>
                {t("bookAnother")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScaleIn>
    )
  }

  // ── Step: Select date + time ─────────────────────────────────────────────────
  if (step === "select-datetime" && selectedDoctor) {
    const palette = specialtyPalette(selectedDoctor.specialty)

    // Only show slots if a date is selected and it's an available day
    const dateIsAvailable = selectedDate && !isDisabledDay(selectedDate)

    function SlotGroup({ label, slots }: { label: string; slots: string[] }) {
      if (!dateIsAvailable) return null
      return (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="grid grid-cols-3 gap-2">
            {slots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition-all ${
                  time === slot
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <FadeIn className="flex flex-col gap-5">
        <StepIndicator current={2} labels={[t("stepDoctor"), t("stepDateTime"), t("stepConfirm")]} />

        <button
          onClick={() => { setStep("select-doctor"); setSelectedDate(undefined); setTime("") }}
          className="text-sm text-muted-foreground hover:text-foreground text-start flex items-center gap-1.5 w-fit transition-colors"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t("backToDoctors")}
        </button>

        {/* Doctor summary pill */}
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${palette.bg} ${palette.text}`}>
            {doctorInitials(selectedDoctor.full_name)}
          </span>
          <div>
            <p className="font-semibold leading-tight">{selectedDoctor.full_name}</p>
            <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
          </div>
        </div>

        {/* 2-column layout on desktop: calendar | slots + notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Calendar */}
          <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="size-4 text-primary" />
              <p className="text-sm font-semibold">{t("date")}</p>
            </div>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(d) => { setSelectedDate(d); setTime("") }}
              disabled={isDisabledDay}
              navLayout="around"
              animate
              locale={calLocale}
            />
            {/* Available days hint */}
            <p className="text-xs text-muted-foreground text-center mt-1">
              {selectedDoctor.available_days.join(" · ")}
            </p>
          </div>

          {/* Right: Time slots + notes */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <p className="text-sm font-semibold">{t("timeSlot")}</p>
            </div>

            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">{t("date")} ↩</p>
            ) : !dateIsAvailable ? (
              <p className="text-sm text-muted-foreground">{t("noSlotsOnDay")}</p>
            ) : (
              <div className="flex flex-col gap-4">
                <SlotGroup label={t("morning")} slots={MORNING_SLOTS} />
                <SlotGroup label={t("afternoon")} slots={AFTERNOON_SLOTS} />
              </div>
            )}

            {/* Notes */}
            <div className="flex flex-col gap-1.5 mt-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder={t("notesPlaceholder")}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="resize-none"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button
              onClick={handleBook}
              disabled={!dateStr || !time || isPending}
              className="gap-2"
            >
              {isPending
                ? <><Loader2 className="size-4 animate-spin" />{t("booking")}</>
                : <><CalendarCheck className="size-4" />{t("confirm")}</>
              }
            </Button>
          </div>
        </div>
      </FadeIn>
    )
  }

  // ── Step: Select doctor ──────────────────────────────────────────────────────
  if (loadingDoctors) return <DoctorGridSkeleton />

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={1} labels={[t("stepDoctor"), t("stepDateTime"), t("stepConfirm")]} />

      {/* Search */}
      <div className="flex gap-3 items-center max-w-sm">
        <Input
          placeholder={t("filterPlaceholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-muted-foreground text-sm hover:text-foreground whitespace-nowrap transition-colors">
            {tc("clear")}
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground">{t("noDoctors", { query: search })}</p>
      )}

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerChildren={0.06}>
        {filtered.map(doc => {
          const pal = specialtyPalette(doc.specialty)
          const initials = doctorInitials(doc.full_name)
          return (
            <StaggerItem key={doc.id}>
              <Card className="h-full flex flex-col hover:shadow-lg hover:border-primary/30 transition-shadow duration-200">
                <CardHeader className="pb-3">
                  {/* Avatar row */}
                  <div className="flex items-start gap-3">
                    <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-base font-bold ${pal.bg} ${pal.text}`}>
                      {initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold leading-snug">{doc.full_name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">{doc.specialty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 flex-1">
                  {doc.bio && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{doc.bio}</p>}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                    <CalendarDays className="size-3.5 shrink-0" />
                    <span className="truncate">{doc.available_days.join(", ")}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-1 gap-1.5"
                    onClick={() => { setSelectedDoctor(doc); setStep("select-datetime") }}
                  >
                    <CalendarCheck className="size-3.5" />
                    {t("bookWithDoctor", { name: doc.full_name })}
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </StaggerContainer>
    </div>
  )
}
