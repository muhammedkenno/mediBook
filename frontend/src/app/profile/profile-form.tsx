"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Loader2, User, Shield } from "lucide-react"
import { updateProfile, updatePassword } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileFormProps {
  initialName: string
  email: string
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const t = useTranslations("profile")

  // ── Profile info ──────────────────────────────────────────────────────────
  const [name, setName] = useState(initialName)
  const [savingProfile, setSavingProfile] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const result = await updateProfile({ full_name: name })
    setSavingProfile(false)
    if (result.error) toast.error(result.error)
    else toast.success(t("saved"))
  }

  // ── Password ──────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError("")

    if (newPassword.length < 8) {
      setPasswordError(t("passwordTooShort"))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch"))
      return
    }

    setSavingPassword(true)
    const result = await updatePassword({ password: newPassword, confirmPassword })
    setSavingPassword(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("passwordUpdated"))
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Personal info ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-primary" />
            {t("personalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">{t("fullName")}</Label>
              <Input
                id="full_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                maxLength={100}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted/40 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">{t("emailNote")}</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile} className="gap-2 min-w-[130px]">
                {savingProfile
                  ? <><Loader2 className="size-4 animate-spin" />{t("saving")}</>
                  : t("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Password ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4 text-primary" />
            {t("security")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new_password">{t("newPassword")}</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_password">{t("confirmPassword")}</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingPassword || !newPassword}
                variant="outline"
                className="gap-2 min-w-[160px]"
              >
                {savingPassword
                  ? <><Loader2 className="size-4 animate-spin" />{t("updatingPassword")}</>
                  : t("updatePassword")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
