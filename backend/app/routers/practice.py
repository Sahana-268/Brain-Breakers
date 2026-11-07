from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PracticeSession, Student, User, UserRole
from app.schemas.practice import PracticeSessionCreate, PracticeSessionOut
from app.core.dependencies import get_current_user
from app.core.exceptions import ForbiddenException

router = APIRouter(prefix="/practice", tags=["Practice"])


@router.post("/sessions", response_model=PracticeSessionOut, status_code=201)
def log_practice_session(
    payload: PracticeSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can log practice sessions.")
    student = current_user.student_profile

    accuracy = (
        round(payload.problems_correct / payload.problems_attempted * 100, 2)
        if payload.problems_attempted > 0 else 0.0
    )

    session = PracticeSession(
        student_id=student.id,
        practice_type=payload.practice_type,
        duration_seconds=payload.duration_seconds,
        problems_attempted=payload.problems_attempted,
        problems_correct=payload.problems_correct,
        accuracy=accuracy,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/my", response_model=list)
def my_practice_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 30,
):
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can access this endpoint.")
    student = current_user.student_profile
    sessions = (
        db.query(PracticeSession)
        .filter(PracticeSession.student_id == student.id)
        .order_by(PracticeSession.session_date.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": s.id,
            "practice_type": s.practice_type.value,
            "duration_seconds": s.duration_seconds,
            "problems_attempted": s.problems_attempted,
            "problems_correct": s.problems_correct,
            "accuracy": s.accuracy,
            "session_date": s.session_date.isoformat(),
        }
        for s in sessions
    ]

