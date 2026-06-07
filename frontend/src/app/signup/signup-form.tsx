"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { FadeIn, ScaleIn } from "@/components/motion/primitives"
import { createClient } from "@/lib/supabase-client"
import { SignupSchema } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SignupForm() {
  const t = useTranslations("auth")
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = SignupSchema.safeParse({ fullName, email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.session) {
      router.push("/check-symptoms")
    } else {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    }
    router.refresh()
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.72_0.12_215/0.15),transparent)]"
      />
      <ScaleIn delay={0.05}>
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </span>
          MediBook
        </Link>
      </ScaleIn>
      <FadeIn delay={0.12} duration={0.4}>
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle>{t("createAccount")}</CardTitle>
            <CardDescription>{t("signUpSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full_name">{t("fullName")}</Label>
                <Input
                  id="full_name"
                  placeholder={t("fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  aria-describedby="password-hint"
                />
                <p id="password-hint" className="text-xs text-muted-foreground">{t("passwordHint")}</p>
              </div>
              {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("creatingAccount") : t("createAccount")}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t("haveAccount")}{" "}
                <Link href="/login" className="underline underline-offset-2">{t("signInLink")}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
