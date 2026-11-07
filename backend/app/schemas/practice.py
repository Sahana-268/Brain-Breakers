from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PracticeSessionCreate(BaseModel):
    practice_type: str
    duration_seconds: int
    problems_attempted: int
    problems_correct: int


class PracticeSessionOut(BaseModel):
    id: int
    practice_type: str
    duration_seconds: int
    problems_attempted: int
    problems_correct: int
    accuracy: float
    session_date: datetime

    model_config = {"from_attributes": True}

