from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ExamAttempt, Student, User, UserRole
from app.core.dependencies import get_current_user, require_teacher_or_admin
from app.core.exceptions import ForbiddenException

router = APIRouter(prefix="/results", tags=["Results"])


@router.get("/my", response_model=List[dict])
def my_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can access this endpoint.")
    student = current_user.student_profile
    attempts = (
        db.query(ExamAttempt)
        .filter(ExamAttempt.student_id == student.id, ExamAttempt.submitted_at != None)
        .order_by(ExamAttempt.submitted_at.desc())
        .all()
    )
    return [
        {
            "attempt_id": a.id,
            "exam_id": a.exam_id,
            "exam_title": a.exam.title,
            "score": a.score,
            "percentage": a.percentage,
            "grade": a.grade,
            "is_passed": a.is_passed,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
        }
        for a in attempts
    ]


@router.get("/exam/{exam_id}", response_model=List[dict])
def exam_results(
    exam_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_teacher_or_admin),
):
    attempts = (
        db.query(ExamAttempt)
        .filter(ExamAttempt.exam_id == exam_id, ExamAttempt.submitted_at != None)
        .order_by(ExamAttempt.score.desc())
        .all()
    )
    return [
        {
            "attempt_id": a.id,
            "student_id": a.student_id,
            "student_name": a.student.user.full_name,
            "enrollment": a.student.enrollment_number,
            "score": a.score,
            "percentage": a.percentage,
            "grade": a.grade,
            "is_passed": a.is_passed,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
        }
        for a in attempts
    ]

