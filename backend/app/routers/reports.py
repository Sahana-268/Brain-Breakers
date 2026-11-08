from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student, User, UserRole, ExamAttempt, PracticeSession
from app.core.dependencies import get_current_user, require_teacher_or_admin
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/reports", tags=["Parent Reports"])


@router.get("/student/{student_id}", response_model=dict)
def get_student_report_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full statistical report for a student."""
    # Allow student to view own or teacher/admin to view any
    if current_user.role == UserRole.student:
        if current_user.student_profile and current_user.student_profile.id != student_id:
            raise ForbiddenException("You can only view your own report.")
    elif current_user.role not in (UserRole.teacher, UserRole.admin):
        raise ForbiddenException("Access denied.")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise NotFoundException("Student not found.")

    attempts = db.query(ExamAttempt).filter(
        ExamAttempt.student_id == student.id,
        ExamAttempt.submitted_at != None
    ).order_by(ExamAttempt.submitted_at.desc()).all()

    sessions = db.query(PracticeSession).filter(
        PracticeSession.student_id == student.id
    ).order_by(PracticeSession.session_date.desc()).all()

    total_attempts = len(attempts)
    passed_attempts = sum(1 for a in attempts if a.is_passed)
    avg_score = round(sum(a.percentage for a in attempts) / total_attempts, 2) if total_attempts > 0 else 0.0

    total_practice_mins = round(sum(s.duration_seconds for s in sessions) / 60, 1)
    total_practice_problems = sum(s.problems_attempted for s in sessions)
    avg_practice_acc = round(sum(s.accuracy for s in sessions) / len(sessions), 2) if sessions else 0.0

    return {
        "student_id": student.id,
        "full_name": student.user.full_name,
        "email": student.user.email,
        "enrollment_number": student.enrollment_number,
        "current_level": student.current_level,
        "parent_name": student.parent_name or "Not Specified",
        "parent_email": student.parent_email or "Not Specified",
        "parent_phone": student.parent_phone or "Not Specified",
        "metrics": {
            "total_exams": total_attempts,
            "passed_exams": passed_attempts,
            "pass_rate": round((passed_attempts / total_attempts * 100), 1) if total_attempts else 0.0,
            "average_exam_score": avg_score,
            "total_practice_sessions": len(sessions),
            "practice_minutes": total_practice_mins,
            "practice_problems_solved": total_practice_problems,
            "practice_accuracy": avg_practice_acc,
        },
        "recent_exams": [
            {
                "exam_title": a.exam.title,
                "percentage": a.percentage,
                "grade": a.grade,
                "is_passed": a.is_passed,
                "date": a.submitted_at.strftime("%Y-%m-%d") if a.submitted_at else "",
            }
            for a in attempts[:5]
        ]
    }


@router.get("/student/{student_id}/printable", response_class=HTMLResponse)
def get_printable_parent_report(
    student_id: int,
    db: Session = Depends(get_db),
):
    """Generate a high-resolution, printable official Parent Progress Report."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    attempts = db.query(ExamAttempt).filter(
        ExamAttempt.student_id == student.id,
        ExamAttempt.submitted_at != None
    ).order_by(ExamAttempt.submitted_at.desc()).all()

    sessions = db.query(PracticeSession).filter(
        PracticeSession.student_id == student.id
    ).order_by(PracticeSession.session_date.desc()).all()

    total_attempts = len(attempts)
    passed_attempts = sum(1 for a in attempts if a.is_passed)
    avg_score = round(sum(a.percentage for a in attempts) / total_attempts, 2) if total_attempts > 0 else 0.0

    total_practice_mins = round(sum(s.duration_seconds for s in sessions) / 60, 1)
    avg_practice_acc = round(sum(s.accuracy for s in sessions) / len(sessions), 2) if sessions else 0.0

    report_date = datetime.utcnow().strftime("%B %d, %Y")

    exam_rows = ""
    for a in attempts[:6]:
        status_badge = '<span style="color:#16a34a; font-weight:bold;">PASS</span>' if a.is_passed else '<span style="color:#dc2626; font-weight:bold;">RETAKE</span>'
        d_str = a.submitted_at.strftime("%b %d, %Y") if a.submitted_at else "-"
        exam_rows += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{a.exam.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">{d_str}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">{a.percentage}%</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">{a.grade}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">{status_badge}</td>
        </tr>
        """

    if not exam_rows:
        exam_rows = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No examinations recorded yet.</td></tr>'

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Parent Progress Report - {student.user.full_name}</title>
    <style>
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 30px;
        }}
        .report-card {{
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            padding: 40px;
            position: relative;
        }}
        .header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #0284c7;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .logo-title h1 {{
            margin: 0;
            font-size: 26px;
            color: #0f172a;
        }}
        .logo-title p {{
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #0284c7;
            font-weight: 600;
        }}
        .meta-box {{
            text-align: right;
            font-size: 13px;
            color: #64748b;
        }}
        .grid-2 {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
        }}
        .info-card {{
            background: #f1f5f9;
            padding: 18px;
            border-radius: 12px;
        }}
        .info-card h3 {{
            margin: 0 0 10px 0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #475569;
        }}
        .stat-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 30px;
        }}
        .stat-item {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
        }}
        .stat-val {{
            font-size: 24px;
            font-weight: 800;
            color: #0284c7;
            margin-top: 5px;
        }}
        .stat-lbl {{
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 15px;
        }}
        th {{
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            color: #475569;
            letter-spacing: 0.5px;
        }}
        .teacher-notes {{
            background: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 18px;
            border-radius: 12px;
            margin-top: 25px;
            font-size: 13px;
            line-height: 1.6;
            color: #92400e;
        }}
        .print-btn {{
            display: inline-block;
            background: #0284c7;
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 20px;
            cursor: pointer;
        }}
        @media print {{
            .print-btn {{ display: none; }}
            body {{ background: #fff; padding: 0; }}
            .report-card {{ border: none; box-shadow: none; padding: 0; width: 100%; }}
        }}
    </style>
</head>
<body>
    <div style="max-width: 820px; margin: 0 auto;">
        <button onclick="window.print()" class="print-btn">🖨️ Print / Save as PDF</button>
    </div>
    <div class="report-card">
        <div class="header">
            <div class="logo-title">
                <h1>Brain Breakers Academy</h1>
                <p>Think Beyond, Learn Beyond · Official Progress Report</p>
            </div>
            <div class="meta-box">
                <div><strong>Report Date:</strong> {report_date}</div>
                <div><strong>Curriculum:</strong> 8-Level Abacus & Mental Math</div>
            </div>
        </div>

        <div class="grid-2">
            <div class="info-card">
                <h3>Student Information</h3>
                <div><strong>Full Name:</strong> {student.user.full_name}</div>
                <div><strong>Enrollment ID:</strong> {student.enrollment_number}</div>
                <div><strong>Current Syllabus:</strong> Level {student.current_level}</div>
            </div>
            <div class="info-card">
                <h3>Parent / Guardian Contact</h3>
                <div><strong>Parent Name:</strong> {student.parent_name or 'N/A'}</div>
                <div><strong>Parent Email:</strong> {student.parent_email or 'N/A'}</div>
                <div><strong>Emergency Phone:</strong> {student.parent_phone or 'N/A'}</div>
            </div>
        </div>

        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-lbl">Average Score</div>
                <div class="stat-val">{avg_score}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-lbl">Exams Passed</div>
                <div class="stat-val">{passed_attempts}/{total_attempts}</div>
            </div>
            <div class="stat-item">
                <div class="stat-lbl">Practice Time</div>
                <div class="stat-val">{total_practice_mins}m</div>
            </div>
            <div class="stat-item">
                <div class="stat-lbl">Practice Accuracy</div>
                <div class="stat-val">{avg_practice_acc}%</div>
            </div>
        </div>

        <h3>Recent Examination Evaluations</h3>
        <table>
            <thead>
                <tr>
                    <th>Examination</th>
                    <th style="text-align: center;">Date</th>
                    <th style="text-align: center;">Score</th>
                    <th style="text-align: center;">Grade</th>
                    <th style="text-align: center;">Result</th>
                </tr>
            </thead>
            <tbody>
                {exam_rows}
            </tbody>
        </table>

        <div class="teacher-notes">
            <strong>Instructor Remarks:</strong><br/>
            {student.user.full_name} has shown commendable persistence in mental abacus visualization. Regular Flash Anzan sessions and multi-digit operations continue to strengthen cognitive processing and calculation speed. Recommended focus: Continue Level {student.current_level} speed building drills.
        </div>
    </div>
</body>
</html>"""
    return HTMLResponse(content=html)
