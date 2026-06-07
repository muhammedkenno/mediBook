"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import {
  AlertTriangle, Activity, Stethoscope, ArrowRight,
  Loader2, Lightbulb, Mic, MicOff, Square, Printer, Share2,
} from "lucide-react"
import { predictSymptoms } from "@/lib/actions/triage"
import { useVoiceInput, type VoiceErrorReason } from "@/hooks/use-voice-input"
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from "@/components/motion/primitives"
import type { TriageResult } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  ar: "ar-SA",
}

export function SymptomChecker() {
  const t = useTranslations("symptoms")
  const locale = useLocale()
  const router = useRouter()
  const [symptoms, setSymptoms] = useState("")
  const [result, setResult] = useState<TriageResult | null>(null)
  const [loading, setLoading] = useState(false)
  // Once recognition hard-fails (permission/service/network), hide the mic for
  // this session so the jury never sees a repeating error.
  const [voiceUnavailable, setVoiceUnavailable] = useState(false)

  // Append the recognized text (don't replace — user may have typed some already)
  const handleVoiceResult = useCallback((transcript: string) => {
    setSymptoms((prev) => {
      const joined = prev.trim() ? `${prev.trim()} ${transcript}` : transcript
      return joined
    })
  }, [])

  const handleVoiceError = useCallback((reason: VoiceErrorReason, rawCode: string) => {
    if (reason === "no-speech") {
      // Soft failure — let them retry, keep the mic visible
      toast.error(t("voiceNoSpeech"))
      return
    }
    // Hard failure — disable voice for this session and explain once.
    // (rawCode shown temporarily to help diagnose; e.g. "service-not-allowed")
    setVoiceUnavailable(true)
    toast.error(`${t("voiceUnavailable")} [${rawCode}]`)
  }, [t])

  const { state: voiceState, interim, start: startVoice, stop: stopVoice, isSupported } =
    useVoiceInput({
      lang: LANG_MAP[locale] ?? "en-US",
      onResult: handleVoiceResult,
      onError: handleVoiceError,
    })

  const isListening = voiceState === "listening"

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!symptoms.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await predictSymptoms(symptoms)
      setResult(data)
    } catch {
      toast.error(t("errorReach"))
    } finally {
      setLoading(false)
    }
  }

  function handleBookNow() {
    if (!result) return
    const params = new URLSearchParams({ specialty: result.recommended_specialty })
    router.push(`/book?${params}`)
  }

  function handleMicClick() {
    if (!isSupported) {
      toast.error(t("voiceNotSupported"))
      return
    }
    if (isListening) stopVoice()
    else startVoice()
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleCheck} className="flex flex-col gap-3">
        <Label htmlFor="symptoms">{t("label")}</Label>

        {/* Textarea + mic button wrapper */}
        <div className="relative">
          <Textarea
            id="symptoms"
            rows={5}
            placeholder={
              isListening
                ? t("voiceListening")
                : t("placeholder")
            }
            value={isListening && interim ? interim : symptoms}
            onChange={(e) => { if (!isListening) setSymptoms(e.target.value) }}
            required
            className={`resize-none transition-shadow ${voiceUnavailable ? "" : "pe-12"} ${
              isListening
                ? "border-primary ring-2 ring-primary/30 placeholder:text-primary/60"
                : ""
            }`}
          />

          {/* Mic button — hidden once voice hard-fails so no repeating errors */}
          {!voiceUnavailable && (
            <button
              type="button"
              onClick={handleMicClick}
              aria-label={isListening ? t("voiceStop") : t("voiceStart")}
              title={isListening ? t("voiceStop") : t("voiceStart")}
              className={`
                absolute top-2.5 end-2.5
                grid size-8 place-items-center rounded-md
                transition-all border
                ${isListening
                  ? "bg-destructive text-white border-destructive animate-pulse shadow-lg shadow-destructive/30"
                  : isSupported
                    ? "bg-background text-muted-foreground hover:text-foreground hover:border-primary hover:bg-muted"
                    : "bg-background text-muted-foreground/40 cursor-not-allowed"
                }
              `}
            >
              {isListening
                ? <Square className="size-3 fill-current" />
                : isSupported
                  ? <Mic className="size-4" />
                  : <MicOff className="size-4" />
              }
            </button>
          )}
        </div>

        {/* Listening status bar */}
        {isListening && (
          <div className="flex items-center gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="inline-flex gap-0.5 items-end h-4">
              {[0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-full bg-primary animate-bounce"
                  style={{ height: `${h * 16}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </span>
            {t("voiceListening")}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || (!symptoms.trim() && !isListening)}
          className="gap-2 self-start px-6"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("analysing")}
            </>
          ) : (
            <>
              <Activity className="size-4" />
              {t("check")}
            </>
          )}
        </Button>
      </form>

      {result && (
        <FadeIn className="flex flex-col gap-4">
          {result.is_emergency === "Yes" && (
            <ScaleIn>
            <div className="flex gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <AlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-lg leading-tight">
                  {t("emergencyTitle")}
                </p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">{t("emergencyBody")}</p>
              </div>
            </div>
            </ScaleIn>
          )}

          <FadeIn delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="size-4 text-primary" />
                {t("resultTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("likelyCondition")}</p>
                  <p className="font-semibold">{result.predicted_disease}</p>
                  {typeof result.confidence === "number" && result.confidence > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("confidence", { percent: Math.round(result.confidence * 100) })}
                    </p>
                  )}
                </div>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("recommendedSpecialist")}</p>
                  <p className="font-semibold">{result.recommended_specialty}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {result.is_emergency === "Yes" && <Badge variant="destructive">{t("emergency")}</Badge>}
                {result.is_infectious === "Yes" && <Badge variant="warning">{t("infectious")}</Badge>}
                {result.is_emergency === "No" && result.is_infectious === "No" && (
                  <Badge variant="success">{t("nonUrgent")}</Badge>
                )}
              </div>

              {/* Explainable AI — symptom words that drove the prediction */}
              {result.explanation && result.explanation.length > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Lightbulb className="size-4 text-primary" />
                    {t("whyTitle")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("whySubtitle")}</p>
                  <StaggerContainer className="flex flex-wrap gap-2 mt-2.5" staggerChildren={0.06} delayChildren={0.1}>
                    {result.explanation.map((e) => (
                      <StaggerItem key={e.token} y={8}>
                        <span
                          className="rounded-md px-2 py-1 text-sm border border-primary/20 block"
                          style={{
                            backgroundColor: `color-mix(in oklch, var(--primary) ${Math.round(e.weight * 35)}%, transparent)`,
                          }}
                        >
                          {e.token}
                        </span>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}

              {/* Top-3 differential */}
              {result.top_diseases && result.top_diseases.length > 1 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    {t("otherPossibilities")}
                  </p>
                  <div className="flex flex-col gap-2">
                    {result.top_diseases.map((d, i) => {
                      const max = result.top_diseases![0].probability || 1
                      return (
                        <div key={d.label} className="flex items-center gap-3">
                          <span className={`text-sm w-40 shrink-0 truncate ${i === 0 ? "font-semibold" : ""}`}>
                            {d.label}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.round((d.probability / max) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-end shrink-0">
                            {Math.round(d.probability * 100)}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

                  {result.is_emergency !== "Yes" && (
                <Button onClick={handleBookNow} className="w-full sm:w-auto gap-2 group">
                  {t("bookWith", { specialty: result.recommended_specialty })}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </Button>
              )}

              {/* Print / Share */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer className="size-3.5" />
                  {t("print")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={async () => {
                    const text = `MediBook AI Triage Result\n\nCondition: ${result!.predicted_disease}\nSpecialist: ${result!.recommended_specialty}\nEmergency: ${result!.is_emergency}\nInfectious: ${result!.is_infectious}`
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: "MediBook Triage Result", text })
                      } catch {
                        // user cancelled
                      }
                    } else {
                      await navigator.clipboard.writeText(text)
                      toast.success(t("copied"))
                    }
                  }}
                >
                  <Share2 className="size-3.5" />
                  {t("share")}
                </Button>
              </div>
            </CardContent>
          </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
          </FadeIn>
        </FadeIn>
      )}
    </div>
  )
}
