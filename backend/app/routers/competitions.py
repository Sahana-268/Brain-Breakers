from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Competition, CompetitionRegistration, Student, User, UserRole, CompetitionStatus
from app.core.dependencies import get_current_user, require_organizer_or_admin
from app.core.exceptions import NotFoundException, ConflictException, ForbiddenException, BadRequestException
from datetime import datetime

router = APIRouter(prefix="/competitions", tags=["Competitions"])


@router.get("/", response_model=List[dict])
def list_competitions(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    comps = db.query(Competition).order_by(Competition.start_date.desc()).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "comp_type": c.comp_type.value,
            "status": c.status.value,
            "is_online": c.is_online,
            "start_date": c.start_date.isoformat() if c.start_date else None,
            "end_date": c.end_date.isoformat() if c.end_date else None,
            "registration_deadline": c.registration_deadline.isoformat() if c.registration_deadline else None,
            "max_participants": c.max_participants,
            "participant_count": len(c.registrations),
            "venue": c.venue,
        }
        for c in comps
    ]


@router.post("/", response_model=dict, status_code=201)
def create_competition(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin),
):
    comp = Competition(
        title=payload["title"],
        description=payload.get("description"),
        organizer_id=current_user.id,
        comp_type=payload.get("comp_type", "individual"),
        level_id=payload.get("level_id"),
        is_online=payload.get("is_online", True),
        venue=payload.get("venue"),
        max_participants=payload.get("max_participants"),
        prize_details=payload.get("prize_details"),
    )
    if payload.get("start_date"):
        comp.start_date = datetime.fromisoformat(payload["start_date"])
    if payload.get("end_date"):
        comp.end_date = datetime.fromisoformat(payload["end_date"])
    if payload.get("registration_deadline"):
        comp.registration_deadline = datetime.fromisoformat(payload["registration_deadline"])

    db.add(comp)
    db.commit()
    db.refresh(comp)
    return {"id": comp.id, "title": comp.title, "status": comp.status.value}


@router.post("/{comp_id}/register", response_model=dict, status_code=201)
def register_for_competition(
    comp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can register for competitions.")
    comp = db.query(Competition).filter(Competition.id == comp_id).first()
    if not comp:
        raise NotFoundException("Competition not found.")
    if comp.status not in (CompetitionStatus.registration_open, CompetitionStatus.upcoming):
        raise BadRequestException("Registration is not open for this competition.")

    student = current_user.student_profile
    existing = db.query(CompetitionRegistration).filter(
        CompetitionRegistration.competition_id == comp_id,
        CompetitionRegistration.student_id == student.id,
    ).first()
    if existing:
        raise ConflictException("You are already registered for this competition.")

    if comp.max_participants and len(comp.registrations) >= comp.max_participants:
        raise BadRequestException("Competition is full.")

    reg = CompetitionRegistration(competition_id=comp_id, student_id=student.id)
    db.add(reg)
    db.commit()
    return {"message": "Successfully registered!", "competition": comp.title}

