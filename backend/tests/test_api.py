import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient

from app.db import Base, engine
from app.main import app
from app import models  # noqa: F401 — register models with Base

@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    """Create all tables before the test session and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health():
    assert client.get("/health").json() == {"status": "UP"}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "ClinicFlow API"

def test_create_appointment():
    response = client.post(
        "/api/appointments",
        json={
            "patient_name": "Ada Lovelace",
            "doctor": "Dr. Mehta",
            "reason": "Annual checkup",
            "priority": "HIGH",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["patient_name"] == "Ada Lovelace"
    assert body["status"] == "SCHEDULED"

def test_list_appointments():
    response = client.get("/api/appointments")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1

def test_get_appointment():
    created = client.post(
        "/api/appointments",
        json={"patient_name": "Grace Hopper", "doctor": "Dr. Rao", "reason": "Follow-up"},
    ).json()
    response = client.get(f"/api/appointments/{created['id']}")
    assert response.status_code == 200
    assert response.json()["patient_name"] == "Grace Hopper"

def test_update_appointment():
    created = client.post(
        "/api/appointments",
        json={"patient_name": "Alan Turing", "doctor": "Dr. Shah", "reason": "Consultation"},
    ).json()
    response = client.put(
        f"/api/appointments/{created['id']}",
        json={"status": "CHECKED_IN", "priority": "MEDIUM"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "CHECKED_IN"

def test_stats_endpoint():
    response = client.get("/api/appointments/stats")
    assert response.status_code == 200
    body = response.json()
    assert "total" in body
    assert body["total"] >= 1

def test_delete_appointment():
    created = client.post(
        "/api/appointments",
        json={"patient_name": "Delete Me", "doctor": "Dr. Test", "reason": "Cleanup"},
    ).json()
    response = client.delete(f"/api/appointments/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/api/appointments/{created['id']}").status_code == 404
