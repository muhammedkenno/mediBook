"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"
import { SymptomsSchema } from "@/lib/validation"
import type { TriageResult } from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// Safety override rules
//
// The AI model was trained on symptom descriptions, so it sometimes misclassifies
// disease-name inputs (e.g. "Smallpox", "Heart attack"). These keyword lists apply
// deterministic corrections on top of the model output before returning to the UI.
//
// Priority order (highest → lowest):
//   1. EMERGENCY keywords  → force is_emergency = "Yes"
//   2. INFECTIOUS keywords → force is_infectious = "Yes"
//   3. NON_INFECTIOUS keywords → clear is_infectious = "No"
//      (only applied when no INFECTIOUS keyword also matched)
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Life-threatening emergencies ──────────────────────────────────────
const EMERGENCY_KEYWORDS = [
  // Cardiac
  "heart attack", "cardiac arrest", "myocardial infarction",
  "chest pain", "chest tightness", "chest pressure",
  // Respiratory
  "can't breathe", "cannot breathe", "difficulty breathing",
  "stopped breathing", "not breathing", "choking",
  // Neurological
  "stroke", "face drooping", "arm weakness", "sudden numbness",
  "sudden confusion", "sudden severe headache",
  // Bleeding / trauma
  "severe bleeding", "uncontrolled bleeding", "coughing blood",
  "vomiting blood",
  // Consciousness
  "unconscious", "loss of consciousness", "passed out", "fainted",
  "unresponsive",
  // Infectious that are also emergencies
  "ebola", "plague", "rabies bite", "anthrax",
  // Other life-threatening
  "overdose", "poisoning", "anaphylaxis", "severe allergic reaction",
  "seizure", "convulsion",
]

// ── 2. Known infectious diseases / symptoms ───────────────────────────────
// When the user mentions one of these, mark is_infectious = "Yes" regardless
// of what the model says. Covers both disease names and strong clinical cues.
const INFECTIOUS_KEYWORDS = [
  // Classic viral diseases
  "smallpox", "chickenpox", "chicken pox", "monkeypox",
  "measles", "rubella", "german measles", "mumps",
  "influenza", "flu", "swine flu", "bird flu", "avian flu",
  "covid", "coronavirus", "sars", "mers",
  "ebola", "marburg", "dengue", "zika", "chikungunya",
  "yellow fever", "west nile",
  "rabies", "polio", "poliovirus",
  // Respiratory infections
  "tuberculosis", "tb", " pneumonia", "bronchitis",
  "whooping cough", "pertussis", "diphtheria", "croup",
  "respiratory syncytial", "rsv",
  // Gastrointestinal infections
  "cholera", "typhoid", "typhoid fever", "salmonella",
  "norovirus", "rotavirus", "hepatitis a", "hepatitis e",
  "dysentery", "gastroenteritis",
  // Blood-borne / systemic
  "hiv", "aids", "hepatitis b", "hepatitis c",
  "malaria", "leishmaniasis", "trypanosomiasis",
  // Bacterial
  "meningitis", "sepsis", "strep", "streptococcal",
  "staphylococcal", "mrsa", "lyme disease", "lyme",
  "brucellosis", "plague", "anthrax", "botulism", "tetanus",
  "gonorrhea", "syphilis", "chlamydia", "herpes",
  // Fungal / parasitic
  "ringworm", "candidiasis", "aspergillosis",
  "scabies", "lice", "pinworm", "tapeworm",
  // Generic strong cues
  "highly contagious", "contagious", "spreading rash",
  "infected wound", "infected cut",
]

// ── 3. Clearly non-communicable conditions ────────────────────────────────
// Clear is_infectious only when NO infectious keyword also matched (see logic below).
const NON_INFECTIOUS_KEYWORDS = [
  // Cardiovascular / structural
  "heart attack", "cardiac arrest", "myocardial infarction",
  "chest pain", "chest tightness", "heart failure",
  "arrhythmia", "atrial fibrillation",
  // Neurological (non-infectious)
  "stroke", "alzheimer", "parkinson", "multiple sclerosis",
  "epilepsy",
  // Trauma / injury
  "trauma", "injury", "fracture", "broken bone", "sprain",
  "dislocation", "burn", "wound", "laceration",
  // Metabolic / endocrine
  "diabetes", "hypoglycemia", "hyperglycemia",
  "thyroid", "hyperthyroidism", "hypothyroidism",
  // Gastrointestinal (non-infectious)
  "appendicitis", "gallstone", "kidney stone", "hernia",
  // Overdose / poisoning
  "overdose", "poisoning", "intoxication",
  // Psychiatric / pain
  "anxiety", "depression", "panic attack",
  "migraine", "cluster headache",
]

// ─────────────────────────────────────────────────────────────────────────────
function applyRules(symptoms: string, result: TriageResult): TriageResult {
  const lower = symptoms.toLowerCase()

  // 1. Emergency override
  if (EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw))) {
    result = { ...result, is_emergency: "Yes" }
  }

  // 2 & 3. Infectious logic — infectious wins over non-infectious if both match
  const definitelyInfectious    = INFECTIOUS_KEYWORDS.some((kw) => lower.includes(kw))
  const definitelyNonInfectious = NON_INFECTIOUS_KEYWORDS.some((kw) => lower.includes(kw))

  if (definitelyInfectious) {
    result = { ...result, is_infectious: "Yes" }
  } else if (definitelyNonInfectious) {
    result = { ...result, is_infectious: "No" }
  }

  return result
}

// ── Server action ─────────────────────────────────────────────────────────
export async function predictSymptoms(rawSymptoms: string): Promise<TriageResult> {
  const { symptoms } = SymptomsSchema.parse({ symptoms: rawSymptoms })

  const baseUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000"
  const res = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.AI_SERVICE_API_KEY ?? "",
    },
    body: JSON.stringify({ symptoms }),
    cache: "no-store",
    // Abort if the AI service doesn't respond within 15 seconds.
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    throw new Error("The AI service is unavailable. Please try again shortly.")
  }

  // Apply safety rules on top of the raw model output
  const raw    = (await res.json()) as TriageResult
  const result = applyRules(symptoms, raw)

  // Audit log — persist every prediction (links a patient if one is signed in).
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    await createAdminClient().from("triage_logs").insert({
      patient_id:            user?.id ?? null,
      symptoms:              result.user_symptoms,
      predicted_disease:     result.predicted_disease,
      recommended_specialty: result.recommended_specialty,
      is_emergency:          result.is_emergency === "Yes",
      is_infectious:         result.is_infectious === "Yes",
    })
  } catch {
    // Logging must never block the user's result.
  }

  return result
}
