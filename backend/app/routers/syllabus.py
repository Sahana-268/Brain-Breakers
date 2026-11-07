import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import SyllabusLevel, User
from app.core.dependencies import get_current_user, require_admin
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/syllabus", tags=["Syllabus"])


@router.get("/", response_model=List[dict])
def get_all_levels(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    levels = db.query(SyllabusLevel).order_by(SyllabusLevel.level_number).all()
    return [
        {
            "id": l.id,
            "level_number": l.level_number,
            "title": l.title,
            "description": l.description,
            "topics": json.loads(l.topics_json) if l.topics_json else [],
            "passing_marks": l.passing_marks,
            "total_marks": l.total_marks,
            "duration_weeks": l.duration_weeks,
        }
        for l in levels
    ]


@router.get("/{level_number}", response_model=dict)
def get_level(
    level_number: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    level = db.query(SyllabusLevel).filter(SyllabusLevel.level_number == level_number).first()
    if not level:
        raise NotFoundException(f"Level {level_number} not found.")
    return {
        "id": level.id,
        "level_number": level.level_number,
        "title": level.title,
        "description": level.description,
        "topics": json.loads(level.topics_json) if level.topics_json else [],
        "passing_marks": level.passing_marks,
        "total_marks": level.total_marks,
        "duration_weeks": level.duration_weeks,
    }

