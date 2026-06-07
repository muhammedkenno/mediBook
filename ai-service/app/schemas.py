from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    # Cap input length to prevent abuse / oversized payloads
    symptoms: str = Field(min_length=1, max_length=2000)


class Prediction(BaseModel):
    label: str
    probability: float  # 0..1


class TokenWeight(BaseModel):
    token: str
    weight: float  # 0..1 relative importance (1 = strongest contributor)


class TriageResponse(BaseModel):
    user_symptoms: str
    predicted_disease: str
    recommended_specialty: str
    is_emergency: str   # "Yes" | "No"
    is_infectious: str  # "Yes" | "No"

    # --- Explainable AI additions ---
    confidence: float = 0.0                    # probability of the top disease
    top_diseases: list[Prediction] = []        # top-3 likely conditions
    explanation: list[TokenWeight] = []        # symptom words that drove the prediction
