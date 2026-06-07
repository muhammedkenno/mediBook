import { describe, it, expect } from "vitest"
import { normalizeSpecialty, specialtyMatches } from "./specialty"

describe("normalizeSpecialty", () => {
  it("maps the AI's 'General/Internal' to the seeded 'general practice'", () => {
    expect(normalizeSpecialty("General/Internal")).toBe("general practice")
  })

  it("is case- and whitespace-insensitive", () => {
    expect(normalizeSpecialty("  HEART  ")).toBe("cardiology")
  })

  it("passes through an unknown specialty unchanged (lowercased)", () => {
    expect(normalizeSpecialty("Dermatology")).toBe("dermatology")
  })
})

describe("specialtyMatches", () => {
  it("matches a doctor whose specialty is the canonical alias target", () => {
    expect(specialtyMatches("General Practice", "General/Internal")).toBe(true)
  })

  it("matches on partial substring (specialty contains query)", () => {
    expect(specialtyMatches("Infectious Disease", "infectious")).toBe(true)
  })

  it("does not match an unrelated specialty", () => {
    expect(specialtyMatches("Cardiology", "Dermatology")).toBe(false)
  })

  it("matches everything when the query is empty", () => {
    expect(specialtyMatches("Cardiology", "")).toBe(true)
  })
})
