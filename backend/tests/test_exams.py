import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_exam_creation_and_auto_evaluation(client):
    # 1. Register a teacher
    teacher_email = "math_teacher_new@brainbreakers.com"
    client.post("/api/auth/register", json={
        "full_name": "Math Master",
        "email": teacher_email,
        "password": "Password123",
        "role": "teacher"
    })
    t_login = client.post("/api/auth/login", json={"email": teacher_email, "password": "Password123"})
    assert t_login.status_code == 200
    t_token = t_login.json()["access_token"]

    # 2. Teacher creates an exam with 2 questions
    create_res = client.post("/api/exams/", headers={"Authorization": f"Bearer {t_token}"}, json={
        "title": "Speed Addition Level 1",
        "exam_type": "mock",
        "duration_minutes": 10,
        "total_marks": 20,
        "passing_marks": 10,
        "questions": [
            {"question_text": "25 + 15", "correct_answer": 40.0, "marks": 10, "order_index": 0},
            {"question_text": "50 - 20", "correct_answer": 30.0, "marks": 10, "order_index": 1}
        ]
    })
    assert create_res.status_code == 201
    exam_id = create_res.json()["id"]

    # 3. Register a student to take it
    student_email = "abacus_learner_new@brainbreakers.com"
    client.post("/api/auth/register", json={
        "full_name": "Abacus Learner",
        "email": student_email,
        "password": "Password123",
        "role": "student"
    })
    s_login = client.post("/api/auth/login", json={"email": student_email, "password": "Password123"})
    assert s_login.status_code == 200
    s_token = s_login.json()["access_token"]

    # 4. Student starts attempt
    attempt_res = client.post(f"/api/exams/{exam_id}/attempt", headers={"Authorization": f"Bearer {s_token}"})
    assert attempt_res.status_code == 201
    attempt_id = attempt_res.json()["attempt_id"]

    # 5. Get questions (verify correct_answer is stripped for student)
    exam_detail = client.get(f"/api/exams/{exam_id}", headers={"Authorization": f"Bearer {s_token}"}).json()
    assert "correct_answer" not in exam_detail["questions"][0]

    q1_id = exam_detail["questions"][0]["id"]
    q2_id = exam_detail["questions"][1]["id"]

    # 6. Student submits: Q1 correct (40), Q2 wrong (15 instead of 30)
    submit_res = client.post(f"/api/exams/{exam_id}/submit/{attempt_id}", headers={"Authorization": f"Bearer {s_token}"}, json={
        "answers": [
            {"question_id": q1_id, "answer": 40.0},
            {"question_id": q2_id, "answer": 15.0}
        ]
    })
    assert submit_res.status_code == 200
    res = submit_res.json()
    assert res["score"] == 10.0
    assert res["percentage"] == 50.0
    assert res["is_passed"] == True
    assert res["correct_count"] == 1
    assert res["total_questions"] == 2
