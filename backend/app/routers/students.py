from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Student, User, UserRole
from app.core.dependencies import get_current_user, require_teacher_or_admin
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=List[dict])
def list_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Teacher/Admin: list all students."""
    students = db.query(Student).all()
    result = []
    for s in students:
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "full_name": s.user.full_name,
            "email": s.user.email,
            "enrollment_number": s.enrollment_number,
            "current_level": s.current_level,
            "parent_name": s.parent_name,
            "parent_email": s.parent_email,
            "is_active": s.user.is_active,
        })
    return result


@router.get("/my", response_model=dict)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student: get own full profile."""
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can access this endpoint.")
    s = current_user.student_profile
    if not s:
        raise NotFoundException("Student profile not found.")
    return {
        "id": s.id,
        "enrollment_number": s.enrollment_number,
        "current_level": s.current_level,
        "date_of_birth": s.date_of_birth,
        "parent_name": s.parent_name,
        "parent_email": s.parent_email,
        "parent_phone": s.parent_phone,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
    }


@router.get("/{student_id}/progress", response_model=dict)
def get_student_progress(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Teacher/Admin: get a student's exam and practice progress."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise NotFoundException("Student not found.")

    attempts = student.exam_attempts
    sessions = student.practice_sessions

    total_attempts = len(attempts)
    passed = sum(1 for a in attempts if a.is_passed)
    avg_score = (sum(a.percentage for a in attempts) / total_attempts) if total_attempts else 0

    return {
        "student_id": student_id,
        "full_name": student.user.full_name,
        "current_level": student.current_level,
        "total_exam_attempts": total_attempts,
        "exams_passed": passed,
        "average_score": round(avg_score, 2),
        "total_practice_sessions": len(sessions),
        "total_practice_minutes": round(sum(s.duration_seconds for s in sessions) / 60, 1),
    }


@router.patch("/{student_id}/level", response_model=dict)
def update_student_level(
    student_id: int,
    level: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_teacher_or_admin),
):
    """Teacher/Admin: promote or update a student's abacus level."""
    if not 1 <= level <= 8:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Level must be between 1 and 8.")
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise NotFoundException("Student not found.")
    student.current_level = level
    db.commit()
    return {"student_id": student_id, "current_level": student.current_level}

