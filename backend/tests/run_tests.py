import sys
import os

# Ensure unbuffered output in Windows background execution
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

def run_all_checks():
    print("[1/5] Testing FastAPI App initialization...")
    client = TestClient(app)

    print("[2/5] Testing Health Check endpoint...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("   -> Status:", res.json())

    print("[3/5] Testing Admin Login & Auth Token...")
    login_res = client.post("/api/auth/login", json={
        "email": "admin@brainbreakers.com",
        "password": "Admin@1234"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    print("   -> Admin logged in successfully! Role:", login_res.json()["role"])

    print("[4/5] Testing 8-Level Syllabus API...")
    headers = {"Authorization": f"Bearer {token}"}
    syl_res = client.get("/api/syllabus/", headers=headers)
    assert syl_res.status_code == 200
    levels = syl_res.json()
    assert len(levels) == 8, f"Expected 8 levels, got {len(levels)}"
    print(f"   -> Found all {len(levels)} syllabus levels! Level 1: '{levels[0]['title']}', Level 8: '{levels[7]['title']}'")

    print("[5/5] Testing Exam Creation & Auto-Evaluation Engine...")
    # Register teacher
    teacher_email = "test_teacher_auto@brainbreakers.com"
    client.post("/api/auth/register", json={
        "full_name": "Senior Instructor",
        "email": teacher_email,
        "password": "Password123",
        "role": "teacher"
    })
    t_login = client.post("/api/auth/login", json={"email": teacher_email, "password": "Password123"})
    t_token = t_login.json()["access_token"]

    # Teacher creates 2-question math exam
    exam_res = client.post("/api/exams/", headers={"Authorization": f"Bearer {t_token}"}, json={
        "title": "Abacus Speed Test #1",
        "duration_minutes": 15,
        "total_marks": 20,
        "passing_marks": 10,
        "exam_type": "mock",
        "questions": [
            {"question_text": "34 + 56", "correct_answer": 90.0, "marks": 10, "order_index": 0},
            {"question_text": "100 - 45", "correct_answer": 55.0, "marks": 10, "order_index": 1}
        ]
    })
    assert exam_res.status_code == 201
    exam_id = exam_res.json()["id"]

    # Student registers & attempts
    student_email = "test_student_auto@brainbreakers.com"
    client.post("/api/auth/register", json={
        "full_name": "Champion Student",
        "email": student_email,
        "password": "Password123",
        "role": "student"
    })
    s_login = client.post("/api/auth/login", json={"email": student_email, "password": "Password123"})
    s_token = s_login.json()["access_token"]

    attempt_res = client.post(f"/api/exams/{exam_id}/attempt", headers={"Authorization": f"Bearer {s_token}"})
    assert attempt_res.status_code == 201
    attempt_id = attempt_res.json()["attempt_id"]

    # Student gets questions (correct_answer hidden)
    detail = client.get(f"/api/exams/{exam_id}", headers={"Authorization": f"Bearer {s_token}"}).json()
    q0_id = detail["questions"][0]["id"]
    q1_id = detail["questions"][1]["id"]
    assert "correct_answer" not in detail["questions"][0], "correct_answer must be concealed from students"

    # Submit: Q0 correct (90), Q1 correct (55)
    submit_res = client.post(f"/api/exams/{exam_id}/submit/{attempt_id}", headers={"Authorization": f"Bearer {s_token}"}, json={
        "answers": [
            {"question_id": q0_id, "answer": 90.0},
            {"question_id": q1_id, "answer": 55.0}
        ]
    })
    assert submit_res.status_code == 200
    res = submit_res.json()
    assert res["score"] == 20.0
    assert res["percentage"] == 100.0
    assert res["grade"] == "A+"
    assert res["is_passed"] == True
    print(f"   -> Exam evaluated! Score: {res['score']}/{res['total_marks']} ({res['percentage']}%), Grade: {res['grade']}, Passed: {res['is_passed']}")

    print("\n=========================================")
    print("🎉 ALL CORE BACKEND & EXAM TESTS PASSED!")
    print("=========================================\n")

if __name__ == "__main__":
    run_all_checks()
