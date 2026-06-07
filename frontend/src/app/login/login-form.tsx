"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { FadeIn, ScaleIn } from "@/components/motion/primitives"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function LoginForm() {
  const t = useTranslations("auth")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()
    router.push(profile?.role === "admin" ? "/admin/dashboard" : "/check-symptoms")
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
            <CardTitle>{t("welcomeBack")}</CardTitle>
            <CardDescription>{t("signInSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("signingIn") : t("signIn")}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t("noAccount")}{" "}
                <Link href="/signup" className="underline underline-offset-2">{t("signUpLink")}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
