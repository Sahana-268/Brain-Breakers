from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuestionCreate(BaseModel):
    question_text: str
    correct_answer: float
    marks: int = 5
    order_index: int = 0
    question_type: str = "arithmetic"


class ExamCreate(BaseModel):
    title: str
    level_id: Optional[int] = None
    exam_type: str = "mock"
    duration_minutes: int = 30
    total_marks: int = 100
    passing_marks: int = 70
    instructions: Optional[str] = None
    questions: List[QuestionCreate] = []


class ExamOut(BaseModel):
    id: int
    title: str
    exam_type: str
    duration_minutes: int
    total_marks: int
    passing_marks: int
    is_active: bool
    created_at: datetime
    question_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class AnswerSubmit(BaseModel):
    question_id: int
    answer: Optional[float] = None


class ExamSubmission(BaseModel):
    answers: List[AnswerSubmit]


class AttemptResult(BaseModel):
    attempt_id: int
    score: float
    percentage: float
    grade: str
    is_passed: bool
    total_marks: int
    correct_count: int
    total_questions: int

    model_config = {"from_attributes": True}

