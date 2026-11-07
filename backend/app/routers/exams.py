from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Exam, Teacher, User, UserRole, Student
from app.schemas.exam import ExamCreate, ExamOut, ExamSubmission, AttemptResult
from app.core.dependencies import get_current_user, require_teacher_or_admin
from app.services.exam_service import start_exam_attempt, submit_exam
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/exams", tags=["Exams"])


@router.get("/", response_model=List[ExamOut])
def list_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exams = db.query(Exam).filter(Exam.is_active == True).all()
    result = []
    for e in exams:
        out = ExamOut.model_validate(e)
        out.question_count = len(e.questions)
        result.append(out)
    return result


@router.post("/", response_model=ExamOut, status_code=201)
def create_exam(
    payload: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise ForbiddenException("Teacher profile not found.")

    from app.models import Question
    exam = Exam(
        title=payload.title,
        level_id=payload.level_id,
        created_by=teacher.id,
        exam_type=payload.exam_type,
        duration_minutes=payload.duration_minutes,
        total_marks=payload.total_marks,
        passing_marks=payload.passing_marks,
        instructions=payload.instructions,
    )
    db.add(exam)
    db.flush()

    for idx, q in enumerate(payload.questions):
        db.add(Question(
            exam_id=exam.id,
            question_text=q.question_text,
            correct_answer=q.correct_answer,
            marks=q.marks,
            order_index=idx,
            question_type=q.question_type,
        ))

    db.commit()
    db.refresh(exam)
    out = ExamOut.model_validate(exam)
    out.question_count = len(exam.questions)
    return out


@router.get("/{exam_id}", response_model=dict)
def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_active == True).first()
    if not exam:
        raise NotFoundException("Exam not found.")
    return {
        "id": exam.id,
        "title": exam.title,
        "exam_type": exam.exam_type.value,
        "duration_minutes": exam.duration_minutes,
        "total_marks": exam.total_marks,
        "passing_marks": exam.passing_marks,
        "instructions": exam.instructions,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "marks": q.marks,
                "order_index": q.order_index,
                "question_type": q.question_type,
                # NOTE: correct_answer is NOT sent to the client
            }
            for q in exam.questions
        ],
    }


@router.post("/{exam_id}/attempt", response_model=dict, status_code=201)
def begin_attempt(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can attempt exams.")
    student = current_user.student_profile
    if not student:
        raise ForbiddenException("Student profile not found.")
    attempt = start_exam_attempt(db, student.id, exam_id)
    return {"attempt_id": attempt.id, "started_at": attempt.started_at.isoformat()}


@router.post("/{exam_id}/submit/{attempt_id}", response_model=AttemptResult)
def submit(
    exam_id: int,
    attempt_id: int,
    submission: ExamSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can submit exams.")
    student = current_user.student_profile
    return submit_exam(db, attempt_id, student.id, submission)

