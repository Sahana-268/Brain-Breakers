from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer, cast
from app.database import get_db
from app.models import ExamAttempt, Student, User, CompetitionRegistration
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("/", response_model=list)
def global_leaderboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
    limit: int = 50,
):
    """Global leaderboard: top students by average exam score."""
    rows = (
        db.query(
            Student.id,
            Student.enrollment_number,
            Student.current_level,
            User.full_name,
            func.count(ExamAttempt.id).label("total_exams"),
            func.avg(ExamAttempt.percentage).label("avg_score"),
            func.sum(cast(ExamAttempt.is_passed, Integer)).label("passed"),
        )
        .join(User, User.id == Student.user_id)
        .join(ExamAttempt, ExamAttempt.student_id == Student.id)
        .filter(ExamAttempt.submitted_at != None)
        .group_by(Student.id)
        .order_by(func.avg(ExamAttempt.percentage).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "rank": idx + 1,
            "student_id": r[0],
            "enrollment_number": r[1],
            "current_level": r[2],
            "full_name": r[3],
            "total_exams": r[4],
            "avg_score": round(float(r[5] or 0), 2),
        }
        for idx, r in enumerate(rows)
    ]


@router.get("/competition/{comp_id}", response_model=list)
def competition_leaderboard(
    comp_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    regs = (
        db.query(CompetitionRegistration)
        .filter(
            CompetitionRegistration.competition_id == comp_id,
            CompetitionRegistration.final_score != None,
        )
        .order_by(CompetitionRegistration.final_score.desc())
        .all()
    )
    return [
        {
            "rank": r.rank or idx + 1,
            "student_id": r.student_id,
            "full_name": r.student.user.full_name,
            "enrollment_number": r.student.enrollment_number,
            "final_score": r.final_score,
        }
        for idx, r in enumerate(regs)
    ]

