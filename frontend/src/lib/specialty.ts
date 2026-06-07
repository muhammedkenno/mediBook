// Maps AI-returned specialty names to the labels used in the doctors table.
export const SPECIALTY_ALIASES: Record<string, string[]> = {
  "general practice": ["general/internal", "general internal", "internal medicine", "general"],
  "cardiology": ["cardiac", "heart"],
  "respiratory": ["pulmonology", "pulmonologist"],
  "infectious disease": ["infectious", "infection"],
}

export function normalizeSpecialty(raw: string): string {
  const lower = raw.toLowerCase().trim()
  for (const [canonical, aliases] of Object.entries(SPECIALTY_ALIASES)) {
    if (aliases.includes(lower)) return canonical
  }
  return lower
}

/** True when a doctor's specialty should be shown for the requested specialty. */
export function specialtyMatches(doctorSpecialty: string, query: string): boolean {
  const q = normalizeSpecialty(query)
  if (!q) return true
  const d = doctorSpecialty.toLowerCase()
  return d.includes(q) || q.includes(d)
}
