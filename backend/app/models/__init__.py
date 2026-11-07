"""
SQLAlchemy ORM models for Brain Breakers Academy.
All models in one import-safe module to avoid circular imports.
"""
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import (
    Integer, String, Boolean, DateTime, Date, Float,
    Text, ForeignKey, Enum as SAEnum, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    organizer = "organizer"


class ExamType(str, enum.Enum):
    mock = "mock"
    level_test = "level_test"
    competition = "competition"


class CompetitionType(str, enum.Enum):
    individual = "individual"
    team = "team"


class CompetitionStatus(str, enum.Enum):
    upcoming = "upcoming"
    registration_open = "registration_open"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class PracticeType(str, enum.Enum):
    addition = "addition"
    subtraction = "subtraction"
    multiplication = "multiplication"
    division = "division"
    mental_maths = "mental_maths"
    flash_anzan = "flash_anzan"
    mixed = "mixed"


class CertificateType(str, enum.Enum):
    level_completion = "level_completion"
    competition_winner = "competition_winner"
    competition_participation = "competition_participation"
    achievement = "achievement"


class RegistrationStatus(str, enum.Enum):
    registered = "registered"
    confirmed = "confirmed"
    disqualified = "disqualified"
    withdrew = "withdrew"


# ---------------------------------------------------------------------------
# User (base account for all roles)
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    profile_photo: Mapped[Optional[str]] = mapped_column(String(512))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    student_profile: Mapped[Optional["Student"]] = relationship("Student", back_populates="user", uselist=False)
    teacher_profile: Mapped[Optional["Teacher"]] = relationship("Teacher", back_populates="user", uselist=False)


# ---------------------------------------------------------------------------
# Student
# ---------------------------------------------------------------------------

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    teacher_id: Mapped[Optional[int]] = mapped_column(ForeignKey("teachers.id"))
    enrollment_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    current_level: Mapped[int] = mapped_column(Integer, default=1)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date)
    parent_name: Mapped[Optional[str]] = mapped_column(String(150))
    parent_email: Mapped[Optional[str]] = mapped_column(String(254))
    parent_phone: Mapped[Optional[str]] = mapped_column(String(20))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="student_profile")
    teacher: Mapped[Optional["Teacher"]] = relationship("Teacher", back_populates="students")
    exam_attempts: Mapped[List["ExamAttempt"]] = relationship("ExamAttempt", back_populates="student")
    competition_registrations: Mapped[List["CompetitionRegistration"]] = relationship(
        "CompetitionRegistration", back_populates="student"
    )
    certificates: Mapped[List["Certificate"]] = relationship("Certificate", back_populates="student")
    practice_sessions: Mapped[List["PracticeSession"]] = relationship("PracticeSession", back_populates="student")
    student_achievements: Mapped[List["StudentAchievement"]] = relationship(
        "StudentAchievement", back_populates="student"
    )


# ---------------------------------------------------------------------------
# Teacher
# ---------------------------------------------------------------------------

class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    qualification: Mapped[Optional[str]] = mapped_column(String(200))
    center_name: Mapped[Optional[str]] = mapped_column(String(200))
    center_address: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="teacher_profile")
    students: Mapped[List["Student"]] = relationship("Student", back_populates="teacher")
    exams_created: Mapped[List["Exam"]] = relationship("Exam", back_populates="creator")


# ---------------------------------------------------------------------------
# Syllabus Level
# ---------------------------------------------------------------------------

class SyllabusLevel(Base):
    __tablename__ = "syllabus_levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level_number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    topics_json: Mapped[Optional[str]] = mapped_column(Text)  # JSON string of topic list
    passing_marks: Mapped[int] = mapped_column(Integer, default=70)
    total_marks: Mapped[int] = mapped_column(Integer, default=100)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=4)

    exams: Mapped[List["Exam"]] = relationship("Exam", back_populates="level")


# ---------------------------------------------------------------------------
# Exam
# ---------------------------------------------------------------------------

class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    level_id: Mapped[Optional[int]] = mapped_column(ForeignKey("syllabus_levels.id"))
    created_by: Mapped[int] = mapped_column(ForeignKey("teachers.id"), nullable=False)
    exam_type: Mapped[ExamType] = mapped_column(SAEnum(ExamType), default=ExamType.mock)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    total_marks: Mapped[int] = mapped_column(Integer, default=100)
    passing_marks: Mapped[int] = mapped_column(Integer, default=70)
    instructions: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    level: Mapped[Optional["SyllabusLevel"]] = relationship("SyllabusLevel", back_populates="exams")
    creator: Mapped["Teacher"] = relationship("Teacher", back_populates="exams_created")
    questions: Mapped[List["Question"]] = relationship(
        "Question", back_populates="exam", order_by="Question.order_index"
    )
    attempts: Mapped[List["ExamAttempt"]] = relationship("ExamAttempt", back_populates="exam")


# ---------------------------------------------------------------------------
# Question
# ---------------------------------------------------------------------------

class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    exam_id: Mapped[int] = mapped_column(ForeignKey("exams.id"), nullable=False)
    question_type: Mapped[str] = mapped_column(String(30), default="arithmetic")  # arithmetic, mcq
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[float] = mapped_column(Float, nullable=False)
    marks: Mapped[int] = mapped_column(Integer, default=5)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    exam: Mapped["Exam"] = relationship("Exam", back_populates="questions")
    student_answers: Mapped[List["StudentAnswer"]] = relationship("StudentAnswer", back_populates="question")


# ---------------------------------------------------------------------------
# Exam Attempt
# ---------------------------------------------------------------------------

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    exam_id: Mapped[int] = mapped_column(ForeignKey("exams.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    percentage: Mapped[float] = mapped_column(Float, default=0.0)
    grade: Mapped[Optional[str]] = mapped_column(String(5))
    is_passed: Mapped[bool] = mapped_column(Boolean, default=False)

    student: Mapped["Student"] = relationship("Student", back_populates="exam_attempts")
    exam: Mapped["Exam"] = relationship("Exam", back_populates="attempts")
    answers: Mapped[List["StudentAnswer"]] = relationship("StudentAnswer", back_populates="attempt")


# ---------------------------------------------------------------------------
# Student Answer
# ---------------------------------------------------------------------------

class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("exam_attempts.id"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), nullable=False)
    student_answer: Mapped[Optional[float]] = mapped_column(Float)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    marks_obtained: Mapped[int] = mapped_column(Integer, default=0)

    attempt: Mapped["ExamAttempt"] = relationship("ExamAttempt", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="student_answers")


# ---------------------------------------------------------------------------
# Competition
# ---------------------------------------------------------------------------

class Competition(Base):
    __tablename__ = "competitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    organizer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    comp_type: Mapped[CompetitionType] = mapped_column(SAEnum(CompetitionType), default=CompetitionType.individual)
    level_id: Mapped[Optional[int]] = mapped_column(ForeignKey("syllabus_levels.id"))
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    registration_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    status: Mapped[CompetitionStatus] = mapped_column(SAEnum(CompetitionStatus), default=CompetitionStatus.upcoming)
    max_participants: Mapped[Optional[int]] = mapped_column(Integer)
    is_online: Mapped[bool] = mapped_column(Boolean, default=True)
    venue: Mapped[Optional[str]] = mapped_column(String(300))
    prize_details: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    organizer: Mapped["User"] = relationship("User")
    registrations: Mapped[List["CompetitionRegistration"]] = relationship(
        "CompetitionRegistration", back_populates="competition"
    )


# ---------------------------------------------------------------------------
# Competition Registration
# ---------------------------------------------------------------------------

class CompetitionRegistration(Base):
    __tablename__ = "competition_registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    competition_id: Mapped[int] = mapped_column(ForeignKey("competitions.id"), nullable=False)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    status: Mapped[RegistrationStatus] = mapped_column(
        SAEnum(RegistrationStatus), default=RegistrationStatus.registered
    )
    registered_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    final_score: Mapped[Optional[float]] = mapped_column(Float)
    rank: Mapped[Optional[int]] = mapped_column(Integer)

    competition: Mapped["Competition"] = relationship("Competition", back_populates="registrations")
    student: Mapped["Student"] = relationship("Student", back_populates="competition_registrations")


# ---------------------------------------------------------------------------
# Achievement
# ---------------------------------------------------------------------------

class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(10), default="🏆")
    criteria_type: Mapped[str] = mapped_column(String(50))  # e.g. practice_sessions, exam_score
    criteria_value: Mapped[int] = mapped_column(Integer)

    student_achievements: Mapped[List["StudentAchievement"]] = relationship(
        "StudentAchievement", back_populates="achievement"
    )


# ---------------------------------------------------------------------------
# Student Achievement (join table)
# ---------------------------------------------------------------------------

class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id"), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="student_achievements")
    achievement: Mapped["Achievement"] = relationship("Achievement", back_populates="student_achievements")


# ---------------------------------------------------------------------------
# Certificate
# ---------------------------------------------------------------------------

class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    cert_type: Mapped[CertificateType] = mapped_column(SAEnum(CertificateType))
    level_id: Mapped[Optional[int]] = mapped_column(ForeignKey("syllabus_levels.id"))
    competition_id: Mapped[Optional[int]] = mapped_column(ForeignKey("competitions.id"))
    cert_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    file_path: Mapped[Optional[str]] = mapped_column(String(512))

    student: Mapped["Student"] = relationship("Student", back_populates="certificates")


# ---------------------------------------------------------------------------
# Practice Session
# ---------------------------------------------------------------------------

class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    practice_type: Mapped[PracticeType] = mapped_column(SAEnum(PracticeType))
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    problems_attempted: Mapped[int] = mapped_column(Integer, default=0)
    problems_correct: Mapped[int] = mapped_column(Integer, default=0)
    accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    session_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="practice_sessions")

