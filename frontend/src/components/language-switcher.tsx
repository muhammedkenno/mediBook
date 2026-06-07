"use client"

import { useTransition } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { setUserLocale } from "@/i18n/locale"
import { type Locale } from "@/i18n/config"

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(next: Locale) {
    if (next === locale) return
    startTransition(async () => {
      await setUserLocale(next)
      router.refresh()
    })
  }

  return (
    <div className="inline-flex items-center rounded-md border text-sm overflow-hidden">
      <button
        onClick={() => switchTo("en")}
        disabled={isPending}
        className={`px-2.5 py-1 transition-colors ${
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("ar")}
        disabled={isPending}
        className={`px-2.5 py-1 transition-colors ${
          locale === "ar"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground"
        }`}
        aria-pressed={locale === "ar"}
      >
        ع
      </button>
    </div>
  )
}
