"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type VoiceState = "idle" | "listening" | "error" | "unsupported"

// Typed reasons so the caller can show the right i18n message.
export type VoiceErrorReason =
  | "permission"   // user denied microphone access
  | "no-mic"       // no microphone device found
  | "no-speech"    // recognition timed out with silence
  | "generic"      // anything else

// Web Speech API types aren't in the default TS dom lib version;
// declare the minimum we need rather than bumping the whole lib target.
type SR = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface UseVoiceInputOptions {
  lang?: string
  onResult: (transcript: string) => void
  onError?: (reason: VoiceErrorReason, rawCode: string) => void
}

function classifyError(code: string): VoiceErrorReason {
  if (code === "not-allowed" || code === "service-not-allowed") return "permission"
  if (code === "audio-capture") return "no-mic"
  if (code === "no-speech") return "no-speech"
  return "generic"
}

export function useVoiceInput({ lang = "en-US", onResult, onError }: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceState>("idle")
  const [interim, setInterim] = useState("")
  const recRef = useRef<SR | null>(null)
  const errorFiredRef = useRef(false)  // prevent duplicate toasts on same session

  // Start optimistic (true) so the server and the first client render MATCH —
  // `window` only exists on the client, and branching on it during render
  // causes a hydration mismatch. We resolve the real value after mount.
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    const ok =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    setIsSupported(ok)
    if (!ok) setState("unsupported")
  }, [])

  const start = useCallback(() => {
    if (!isSupported) { setState("unsupported"); return }
    if (state === "listening") { recRef.current?.stop(); return }

    const SRClass =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition
    const rec: SR = new SRClass()

    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1

    errorFiredRef.current = false   // reset for this new session

    rec.onstart = () => { setState("listening"); setInterim("") }

    rec.onresult = (e: any) => {
      let finalText = ""
      let interimText = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += chunk
        else interimText += chunk
      }
      setInterim(interimText)
      if (finalText) onResult(finalText.trim())
    }

    rec.onerror = (e: any) => {
      const rawCode = e.error ?? "unknown"
      const reason = classifyError(rawCode)
      setInterim("")
      setState(reason === "no-speech" ? "idle" : "error")
      // Surface the raw code in devtools for diagnosis
      console.warn("[voice] recognition error:", rawCode)
      // Fire the callback only once per recognition session
      if (!errorFiredRef.current) {
        errorFiredRef.current = true
        onError?.(reason, rawCode)
      }
    }

    rec.onend = () => {
      setState((s) => (s === "listening" ? "idle" : s))
      setInterim("")
      recRef.current = null
    }

    recRef.current = rec
    try {
      rec.start()
    } catch {
      // Already started — can happen on rapid double-click
      setState("idle")
    }
  }, [isSupported, lang, state, onResult, onError])

  const stop = useCallback(() => {
    recRef.current?.stop()
  }, [])

  return { state, interim, start, stop, isSupported }
}
