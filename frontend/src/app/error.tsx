"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("errors")

  useEffect(() => {
    // Log the error to an error reporting service (console for now)
    console.error("[App Error]", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="mb-6 size-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="size-10 text-destructive" />
      </div>

      <h1 className="text-2xl font-bold mb-2">{t("error")}</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">{t("errorDesc")}</p>

      {error.digest && (
        <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
          {error.digest}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className={buttonVariants({ variant: "default" }) + " gap-2"}
        >
          <RefreshCw className="size-4" />
          {t("retry")}
        </button>
        <Link href="/" className={buttonVariants({ variant: "outline" }) + " gap-2"}>
          <Home className="size-4" />
          {t("goHome")}
        </Link>
      </div>
    </div>
  )
}
