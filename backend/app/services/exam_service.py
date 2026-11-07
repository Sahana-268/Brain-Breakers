from typing import Optional
from sqlalchemy.orm import Session
from app.models import ExamAttempt, StudentAnswer, Question, Exam
from app.schemas.exam import ExamSubmission, AttemptResult
from app.core.exceptions import NotFoundException, BadRequestException
from datetime import datetime


def _calculate_grade(percentage: float) -> str:
    if percentage >= 90:
        return "A+"
    elif percentage >= 80:
        return "A"
    elif percentage >= 70:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 50:
        return "D"
    return "F"


def start_exam_attempt(db: Session, student_id: int, exam_id: int) -> ExamAttempt:
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_active == True).first()
    if not exam:
        raise NotFoundException("Exam not found or inactive.")

    # Prevent duplicate active attempt
    existing = db.query(ExamAttempt).filter(
        ExamAttempt.student_id == student_id,
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.submitted_at == None,
    ).first()
    if existing:
        return existing

    attempt = ExamAttempt(student_id=student_id, exam_id=exam_id)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def submit_exam(db: Session, attempt_id: int, student_id: int, submission: ExamSubmission) -> AttemptResult:
    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.id == attempt_id,
        ExamAttempt.student_id == student_id,
    ).first()
    if not attempt:
        raise NotFoundException("Exam attempt not found.")
    if attempt.submitted_at is not None:
        raise BadRequestException("This exam has already been submitted.")

    exam = db.query(Exam).filter(Exam.id == attempt.exam_id).first()
    questions = {q.id: q for q in exam.questions}

    total_score = 0
    correct_count = 0

    for ans in submission.answers:
        q = questions.get(ans.question_id)
        if not q:
            continue
        # Tolerance: allow ±0.001 for float answers
        is_correct = ans.answer is not None and abs(ans.answer - q.correct_answer) < 0.001
        marks = q.marks if is_correct else 0
        total_score += marks
        if is_correct:
            correct_count += 1

        db.add(StudentAnswer(
            attempt_id=attempt_id,
            question_id=ans.question_id,
            student_answer=ans.answer,
            is_correct=is_correct,
            marks_obtained=marks,
        ))

    percentage = (total_score / exam.total_marks * 100) if exam.total_marks else 0
    grade = _calculate_grade(percentage)
    is_passed = total_score >= exam.passing_marks

    attempt.submitted_at = datetime.utcnow()
    attempt.score = total_score
    attempt.percentage = round(percentage, 2)
    attempt.grade = grade
    attempt.is_passed = is_passed

    db.commit()
    db.refresh(attempt)

    return AttemptResult(
        attempt_id=attempt.id,
        score=total_score,
        percentage=round(percentage, 2),
        grade=grade,
        is_passed=is_passed,
        total_marks=exam.total_marks,
        correct_count=correct_count,
        total_questions=len(questions),
    )

