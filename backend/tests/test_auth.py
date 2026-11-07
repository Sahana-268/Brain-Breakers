import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_syllabus_levels_seeded(client):
    login_res = client.post("/api/auth/login", json={
        "email": "admin@brainbreakers.com",
        "password": "Admin@1234"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    res = client.get("/api/syllabus/", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    levels = res.json()
    assert len(levels) == 8
    assert levels[0]["level_number"] == 1
    assert levels[7]["level_number"] == 8

def test_student_registration_and_login(client):
    email = f"student_test_{pytest.__version__}@brainbreakers.com"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Test Student",
        "email": email,
        "password": "Password123",
        "role": "student"
    })
    assert reg_res.status_code == 201
    assert reg_res.json()["email"] == email

    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password123"
    })
    assert login_res.status_code == 200
    assert login_res.json()["role"] == "student"
    assert "access_token" in login_res.json()
