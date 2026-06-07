import pytest
from fastapi.testclient import TestClient

from app import main
from app.main import app

# The model files load from MODEL_DIR at startup; the dev .env points there.
API_KEY = main.API_KEY
AUTH = {"X-API-Key": API_KEY} if API_KEY else {}


@pytest.fixture(scope="module")
def client():
    # `with` triggers the lifespan handler, loading the ML models once.
    with TestClient(app) as c:
        yield c


def test_health_ok(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["models_loaded"] is True


def test_predict_requires_api_key(client):
    if not API_KEY:
        pytest.skip("API key auth disabled (no AI_SERVICE_API_KEY set)")
    res = client.post("/predict", json={"symptoms": "fever cough"})
    assert res.status_code == 401


def test_predict_rejects_wrong_api_key(client):
    if not API_KEY:
        pytest.skip("API key auth disabled")
    res = client.post("/predict", json={"symptoms": "fever"}, headers={"X-API-Key": "wrong"})
    assert res.status_code == 401


def test_predict_returns_full_shape(client):
    res = client.post("/predict", json={"symptoms": "fever cough fatigue"}, headers=AUTH)
    assert res.status_code == 200
    body = res.json()
    for key in (
        "user_symptoms",
        "predicted_disease",
        "recommended_specialty",
        "is_emergency",
        "is_infectious",
    ):
        assert key in body
    assert body["is_emergency"] in ("Yes", "No")
    assert body["is_infectious"] in ("Yes", "No")


def test_red_flag_keyword_forces_emergency(client):
    # "chest pain" is a critical red-flag word — must route to Emergency
    res = client.post(
        "/predict",
        json={"symptoms": "sudden chest pain and crushing pain in left arm"},
        headers=AUTH,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["is_emergency"] == "Yes"
    assert body["recommended_specialty"] == "Emergency"


def test_empty_symptoms_rejected(client):
    res = client.post("/predict", json={"symptoms": "   "}, headers=AUTH)
    # Either schema (min_length) or the letters check rejects it
    assert res.status_code == 422


def test_oversized_symptoms_rejected(client):
    res = client.post("/predict", json={"symptoms": "a" * 2001}, headers=AUTH)
    assert res.status_code == 422
