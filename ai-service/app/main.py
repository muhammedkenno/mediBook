import re
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()  # read ai-service/.env before reading os.getenv below

import joblib
from fastapi import FastAPI, HTTPException, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.schemas import TriageRequest, TriageResponse, Prediction, TokenWeight

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL_DIR = Path(os.getenv("MODEL_DIR", str(Path(__file__).parent.parent.parent / "AI_Engine_Ready")))

# Shared secret between the Next.js server and this service. The frontend never
# calls this endpoint directly from the browser — only the Next server does,
# passing this key in the X-API-Key header.
API_KEY = os.getenv("AI_SERVICE_API_KEY", "")

EMERGENCY_RULES: dict[str, str] = {
    "heart attack": "Yes",
    "paralysis (brain hemorrhage)": "Yes",
    "bronchial asthma": "No",
    "pneumonia": "No",
}
INFECTIOUS_RULES: dict[str, str] = {
    "tuberculosis": "Yes", "malaria": "Yes", "pneumonia": "Yes",
    "chicken pox": "Yes", "typhoid": "Yes", "dengue": "Yes",
    "fungal infection": "Yes", "common cold": "Yes", "aids": "Yes",
}
CRITICAL_WORDS = [
    "chest pain", "crushing pain", "paralysis",
    "brain hemorrhage", "stroke", "severe bleeding",
]

# ---------------------------------------------------------------------------
# Model state — loaded once at startup
# ---------------------------------------------------------------------------
models: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    disease_path = MODEL_DIR / "final_disease_model.pkl"
    specialty_path = MODEL_DIR / "final_specialty_model.pkl"
    if not disease_path.exists() or not specialty_path.exists():
        raise RuntimeError(f"Model files not found in {MODEL_DIR}")
    models["disease"] = joblib.load(disease_path)
    models["specialty"] = joblib.load(specialty_path)
    yield
    models.clear()


# ---------------------------------------------------------------------------
# App + rate limiting
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Hospital Triage AI", version="1.1.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_api_key(key: str = Security(api_key_header)) -> None:
    # If no key is configured on the server, auth is disabled (local dev fallback).
    if not API_KEY:
        return
    if key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


def _clean(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _top_diseases(cleaned: str, k: int = 3) -> tuple[list[Prediction], float]:
    """Top-k most likely diseases with probabilities (predict_proba)."""
    model = models["disease"]
    proba = model.predict_proba([cleaned])[0]
    classes = model.classes_
    order = proba.argsort()[::-1][:k]
    preds = [
        Prediction(label=str(classes[i]).title(), probability=round(float(proba[i]), 4))
        for i in order
    ]
    confidence = round(float(proba.max()), 4)
    return preds, confidence


def _explain(cleaned: str, predicted_label: str, top_n: int = 6) -> list[TokenWeight]:
    """
    Exact per-token contribution to the predicted disease.

    The disease model is a linear pipeline (TF-IDF -> LogisticRegression), so the
    decision score for a class is a weighted sum over features. Each token's
    contribution = tfidf_value(token) * coefficient[predicted_class][token].
    We return the strongest *positive* contributors (the words that pushed the
    model toward this diagnosis), normalized to 0..1 for display.
    """
    model = models["disease"]
    tfidf = model.named_steps["tfidf"]
    clf = model.named_steps["clf"]

    try:
        pred_idx = list(clf.classes_).index(predicted_label)
    except ValueError:
        return []

    coef = clf.coef_[pred_idx]
    feats = tfidf.get_feature_names_out()
    x = tfidf.transform([cleaned]).tocoo()

    contribs = [
        (feats[j], float(v) * float(coef[j]))
        for j, v in zip(x.col, x.data)
        if float(v) * float(coef[j]) > 0
    ]
    contribs.sort(key=lambda t: t[1], reverse=True)
    contribs = contribs[:top_n]
    if not contribs:
        return []

    max_w = contribs[0][1]
    return [
        TokenWeight(token=tok, weight=round(c / max_w, 3) if max_w else 0.0)
        for tok, c in contribs
    ]


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": bool(models)}


@app.post("/predict", response_model=TriageResponse)
@limiter.limit("30/minute")
def predict(request: Request, body: TriageRequest, _: None = Security(require_api_key)):
    cleaned = _clean(body.symptoms)
    if not cleaned:
        raise HTTPException(status_code=422, detail="symptoms must contain letters")

    # Red-flag keyword scan (safety net before ML)
    is_emergency = "No"
    for word in CRITICAL_WORDS:
        if word in cleaned:
            is_emergency = "Yes"
            break

    pred_specialty: str = models["specialty"].predict([cleaned])[0]
    pred_disease: str = models["disease"].predict([cleaned])[0]

    norm_disease = re.sub(r"\s+", " ", str(pred_disease).lower().strip())

    if is_emergency == "No":
        is_emergency = EMERGENCY_RULES.get(norm_disease, "No")
    is_infectious = INFECTIOUS_RULES.get(norm_disease, "No")

    if is_emergency == "Yes":
        pred_specialty = "Emergency"

    # Explainable AI: top-3 likely conditions + the symptom words that drove
    # the headline prediction (computed against the raw ML label, not the title).
    top_diseases, confidence = _top_diseases(cleaned)
    explanation = _explain(cleaned, pred_disease)

    return TriageResponse(
        user_symptoms=body.symptoms,
        predicted_disease=pred_disease.title(),
        recommended_specialty=pred_specialty,
        is_emergency=is_emergency,
        is_infectious=is_infectious,
        confidence=confidence,
        top_diseases=top_diseases,
        explanation=explanation,
    )
