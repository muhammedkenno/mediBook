"use client"

import { useState } from "react"
import { useForm, Controller, type Resolver } from "react-hook-form"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserPlus, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { createDoctor } from "@/lib/actions/doctors"
import {
  SPECIALTIES, WEEKDAYS,
  CreateDoctorSchema,
  type CreateDoctorInput,
} from "@/lib/doctor-constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const spring = { type: "spring", stiffness: 340, damping: 30 } as const

// Custom resolver — calls Zod safeParse directly, typed as `any` to sidestep
// the react-hook-form ResolverError discriminant which clashes with Zod v4.
// Runtime behaviour is fully correct.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolver: Resolver<CreateDoctorInput> = async (values: any) => {
  const result = CreateDoctorSchema.safeParse(values)
  if (result.success) return { values: result.data, errors: {} }
  const errors: Record<string, any> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "root"
    if (!errors[key]) errors[key] = { type: "validation", message: issue.message }
  }
  return { values: {} as any, errors }
}

export function AddDoctorForm() {
  const t = useTranslations("admin")
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDoctorInput>({
    resolver,
    defaultValues: { full_name: "", specialty: undefined, bio: "", available_days: [] },
  })

  async function onSubmit(data: CreateDoctorInput) {
    const result = await createDoctor(data)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(t("doctorAdded"))
    reset()
    setOpen(false)
    router.refresh()
  }

  function handleCancel() {
    reset()
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle button */}
      {!open && (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)} className="gap-2">
            <UserPlus className="size-4" />
            {t("addDoctor")}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={spring}
            className="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            {/* Form header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-primary" />
                <h3 className="font-semibold text-sm">{t("addDoctor")}</h3>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={t("cancel")}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="full_name">{t("fullName")} *</Label>
                  <Input
                    id="full_name"
                    placeholder={t("fullNamePlaceholder")}
                    {...register("full_name")}
                    aria-invalid={!!errors.full_name}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                {/* Specialty */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="specialty">{t("specialtyLabel")} *</Label>
                  <Controller
                    name="specialty"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="specialty"
                        className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-invalid={!!errors.specialty}
                      >
                        <option value="">{t("selectSpecialty")}</option>
                        {SPECIALTIES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.specialty && (
                    <p className="text-xs text-destructive">{errors.specialty.message}</p>
                  )}
                </div>

                {/* Bio — spans both columns */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="bio">{t("bioLabel")}</Label>
                  <Textarea
                    id="bio"
                    rows={2}
                    placeholder={t("bioPlaceholder")}
                    className="resize-none"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-xs text-destructive">{errors.bio.message}</p>
                  )}
                </div>

                {/* Available days — spans both columns */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label>{t("availableDays")} *</Label>
                  <Controller
                    name="available_days"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map(day => {
                          const checked = field.value.includes(day)
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const next = checked
                                  ? field.value.filter(d => d !== day)
                                  : [...field.value, day]
                                field.onChange(next)
                              }}
                              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all select-none ${
                                checked
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "hover:border-primary/50 hover:bg-muted"
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  />
                  {errors.available_days && (
                    <p className="text-xs text-destructive">{errors.available_days.message}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
                  {isSubmitting
                    ? <><Loader2 className="size-4 animate-spin" />{t("saving")}</>
                    : t("save")}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
