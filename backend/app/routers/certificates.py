import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import (
    Certificate,
    CertificateType,
    Achievement,
    StudentAchievement,
    Student,
    User,
    UserRole,
    SyllabusLevel,
)
from app.core.dependencies import get_current_user, require_teacher_or_admin
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/certificates", tags=["Certificates & Achievements"])


class CertificateCreate(BaseModel):
    student_id: int
    cert_type: str = "level_completion"
    level_id: Optional[int] = None
    competition_id: Optional[int] = None


@router.get("/my", response_model=List[dict])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all certificates earned by the logged-in student."""
    if current_user.role != UserRole.student:
        raise ForbiddenException("Only students can access their certificates.")
    student = current_user.student_profile
    if not student:
        return []

    certs = (
        db.query(Certificate)
        .filter(Certificate.student_id == student.id)
        .order_by(Certificate.issued_at.desc())
        .all()
    )

    return [
        {
            "id": c.id,
            "cert_number": c.cert_number,
            "cert_type": c.cert_type.value,
            "issued_at": c.issued_at.isoformat(),
            "level_id": c.level_id,
            "competition_id": c.competition_id,
            "student_name": student.user.full_name,
            "enrollment_number": student.enrollment_number,
        }
        for c in certs
    ]


@router.post("/generate", response_model=dict, status_code=201)
def generate_certificate(
    payload: CertificateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Teacher/Admin: issue an official certificate to a student."""
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise NotFoundException("Student not found.")

    cert_number = f"BBA-{datetime.utcnow().year}-{uuid.uuid4().hex[:6].upper()}"

    cert = Certificate(
        student_id=student.id,
        cert_type=payload.cert_type,
        level_id=payload.level_id,
        competition_id=payload.competition_id,
        cert_number=cert_number,
        issued_at=datetime.utcnow(),
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return {
        "id": cert.id,
        "cert_number": cert.cert_number,
        "student_name": student.user.full_name,
        "cert_type": cert.cert_type.value,
        "issued_at": cert.issued_at.isoformat(),
    }


@router.get("/view/{cert_number}", response_class=HTMLResponse)
def view_printable_certificate(
    cert_number: str,
    db: Session = Depends(get_db),
):
    """Public printable/shareable official certificate HTML view."""
    cert = db.query(Certificate).filter(Certificate.cert_number == cert_number).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    student_name = cert.student.user.full_name
    enrollment = cert.student.enrollment_number
    date_str = cert.issued_at.strftime("%B %d, %Y")
    cert_type_title = cert.cert_type.value.replace("_", " ").title()

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate - {cert.cert_number}</title>
    <style>
        body {{
            font-family: 'Georgia', serif;
            background: #f0f4f8;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}
        .certificate-container {{
            background: #ffffff;
            width: 800px;
            padding: 50px 40px;
            border: 12px solid #0f172a;
            outline: 4px solid #f59e0b;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }}
        .badge-logo {{
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: #0f172a;
            color: #f59e0b;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 10px;
        }}
        h1 {{
            color: #0f172a;
            font-size: 34px;
            letter-spacing: 2px;
            margin: 5px 0;
            text-transform: uppercase;
        }}
        .tagline {{
            color: #2563eb;
            font-size: 14px;
            font-style: italic;
            margin-bottom: 25px;
        }}
        .subtitle {{
            font-size: 16px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 3px;
        }}
        .recipient-name {{
            font-size: 38px;
            color: #0f172a;
            font-weight: bold;
            border-bottom: 2px solid #cbd5e1;
            display: inline-block;
            padding: 0 40px 10px 40px;
            margin: 20px 0;
            font-family: 'Times New Roman', serif;
        }}
        .cert-body {{
            font-size: 16px;
            color: #334155;
            line-height: 1.6;
            max-width: 650px;
            margin: 0 auto 30px auto;
        }}
        .cert-footer {{
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding: 0 30px;
        }}
        .sig-box {{
            text-align: center;
        }}
        .sig-line {{
            border-top: 2px solid #0f172a;
            width: 180px;
            margin-bottom: 5px;
        }}
        .sig-title {{
            font-size: 13px;
            color: #64748b;
            text-transform: uppercase;
        }}
        .cert-id {{
            position: absolute;
            bottom: 15px;
            right: 25px;
            font-size: 11px;
            color: #94a3b8;
            font-family: monospace;
        }}
        .print-btn {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-family: sans-serif;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        @media print {{
            .print-btn {{ display: none; }}
            body {{ background: none; padding: 0; }}
            .certificate-container {{ box-shadow: none; width: 100%; border-width: 8px; }}
        }}
    </style>
</head>
<body>
    <a href="#" onclick="window.print(); return false;" class="print-btn">🖨️ Print / Save as PDF</a>
    <div class="certificate-container">
        <div class="badge-logo">🧮</div>
        <h1>Brain Breakers Academy</h1>
        <div class="tagline">Think Beyond, Learn Beyond</div>
        <div class="subtitle">Certificate of {cert_type_title}</div>
        <p style="margin-top: 20px; color: #64748b; font-size: 14px;">This is proudly presented to</p>
        <div class="recipient-name">{student_name}</div>
        <div class="cert-body">
            For outstanding dedication, mathematical precision, and successful mastery of abacus mental arithmetic curriculum at <strong>Brain Breakers Academy</strong>.
        </div>
        <div class="cert-footer">
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">Program Director</div>
            </div>
            <div class="sig-box">
                <p style="font-weight: bold; color: #0f172a; margin: 0 0 5px 0;">{date_str}</p>
                <div class="sig-line"></div>
                <div class="sig-title">Date Issued</div>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">Academic Council</div>
            </div>
        </div>
        <div class="cert-id">Cert No: {cert.cert_number} | Student ID: {enrollment}</div>
    </div>
</body>
</html>"""
    return HTMLResponse(content=html_content)


@router.get("/achievements/my", response_model=List[dict])
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all unlocked achievements and milestones for the student."""
    if current_user.role != UserRole.student:
        return []
    student = current_user.student_profile
    if not student:
        return []

    achievements = db.query(Achievement).all()
    unlocked_ids = {
        sa.achievement_id: sa.earned_at
        for sa in db.query(StudentAchievement).filter(StudentAchievement.student_id == student.id).all()
    }

    return [
        {
            "id": a.id,
            "name": a.name,
            "description": a.description,
            "icon": a.icon,
            "is_unlocked": a.id in unlocked_ids,
            "earned_at": unlocked_ids[a.id].isoformat() if a.id in unlocked_ids else None,
        }
        for a in achievements
    ]
