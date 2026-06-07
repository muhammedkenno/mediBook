import { describe, it, expect } from "vitest"
import { SymptomsSchema, SignupSchema, UpdateStatusSchema } from "./validation"

describe("SymptomsSchema", () => {
  it("accepts a normal description", () => {
    expect(SymptomsSchema.safeParse({ symptoms: "fever and cough" }).success).toBe(true)
  })

  it("rejects empty / whitespace-only input", () => {
    expect(SymptomsSchema.safeParse({ symptoms: "   " }).success).toBe(false)
  })

  it("rejects input over 2000 characters", () => {
    expect(SymptomsSchema.safeParse({ symptoms: "a".repeat(2001) }).success).toBe(false)
  })
})

describe("SignupSchema", () => {
  it("accepts valid credentials", () => {
    const r = SignupSchema.safeParse({ fullName: "Jane Smith", email: "jane@example.com", password: "secret12" })
    expect(r.success).toBe(true)
  })

  it("rejects a short password", () => {
    const r = SignupSchema.safeParse({ fullName: "Jane Smith", email: "jane@example.com", password: "short" })
    expect(r.success).toBe(false)
  })

  it("rejects an invalid email", () => {
    const r = SignupSchema.safeParse({ fullName: "Jane", email: "not-an-email", password: "secret12" })
    expect(r.success).toBe(false)
  })
})

describe("UpdateStatusSchema", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000"

  it("accepts a valid status + uuid", () => {
    expect(UpdateStatusSchema.safeParse({ appointmentId: uuid, status: "confirmed" }).success).toBe(true)
  })

  it("rejects an unknown status (guards against arbitrary values)", () => {
    expect(UpdateStatusSchema.safeParse({ appointmentId: uuid, status: "approved" }).success).toBe(false)
  })

  it("rejects a non-uuid appointment id", () => {
    expect(UpdateStatusSchema.safeParse({ appointmentId: "42", status: "pending" }).success).toBe(false)
  })
})
