"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function VerifyForm({ email }: { email: string }) {
  const t = useTranslations("verify")
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isPending, startTransition] = useTransition()
  const [resending, startResend] = useTransition()

  async function submit(value: string) {
    if (value.length !== 6) return
    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: value,
        type: "signup",
      })
      if (error || !data.user) {
        toast.error(t("invalidCode"))
        setCode("")
        return
      }

      // Verified — Supabase now has a session. Route based on role.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      toast.success(t("success"))
      router.push(profile?.role === "admin" ? "/admin/dashboard" : "/check-symptoms")
      router.refresh()
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6)
    setCode(digits)
    // Auto-submit the instant the user fills all six digits
    if (digits.length === 6) submit(digits)
  }

  function handleResend() {
    startResend(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ email, type: "signup" })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success(t("resent"))
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(code)
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{t("codeLabel")}</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={handleChange}
          placeholder="123456"
          className="text-center text-2xl tracking-[0.5em] font-mono h-12"
          disabled={isPending}
          autoFocus
        />
      </div>
      <Button type="submit" disabled={isPending || code.length !== 6} className="w-full gap-2">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? t("verifying") : t("submit")}
      </Button>
      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="text-center text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-50"
      >
        {resending ? t("resending") : t("resend")}
      </button>
    </form>
  )
}
