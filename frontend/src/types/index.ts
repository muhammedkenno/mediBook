export interface Profile {
  id: string
  full_name: string | null
  role: "patient" | "admin"
  created_at: string
}

export interface Doctor {
  id: string
  full_name: string
  specialty: string
  available_days: string[]
  bio: string | null
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: "pending" | "confirmed" | "cancelled"
  notes: string | null
  created_at: string
  doctor?: Doctor
  patient?: Profile
}

export interface TriageLog {
  id: string
  patient_id: string
  appointment_id: string | null
  symptoms: string
  predicted_disease: string | null
  recommended_specialty: string | null
  is_emergency: boolean
  is_infectious: boolean
  created_at: string
}

export interface Prediction {
  label: string
  probability: number
}

export interface TokenWeight {
  token: string
  weight: number
}

export interface TriageResult {
  user_symptoms: string
  predicted_disease: string
  recommended_specialty: string
  is_emergency: "Yes" | "No"
  is_infectious: "Yes" | "No"
  // Explainable AI
  confidence?: number
  top_diseases?: Prediction[]
  explanation?: TokenWeight[]
}
