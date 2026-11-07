"""
Brain Breakers Academy – FastAPI Application Entry Point
"""
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, UserRole, SyllabusLevel
from app.core.security import hash_password

# Import all routers
from app.routers import auth, users, students, syllabus, exams, results, competitions, leaderboard, practice


# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)


# ---------------------------------------------------------------------------
# Syllabus seed data
# ---------------------------------------------------------------------------
SYLLABUS_SEED = [
    {
        "level_number": 1,
        "title": "Beginner – Single Digit",
        "description": "Introduction to abacus structure, bead values, and single-digit addition and subtraction.",
        "topics": ["Abacus introduction", "Bead positions", "Numbers 1–9", "Single-digit addition", "Single-digit subtraction"],
        "passing_marks": 60, "total_marks": 100, "duration_weeks": 4,
    },
    {
        "level_number": 2,
        "title": "Elementary – Two Digits",
        "description": "Two-digit addition and subtraction with carry-over and borrow concepts.",
        "topics": ["Two-digit addition", "Two-digit subtraction", "Carry-over", "Borrowing", "Mental image of abacus"],
        "passing_marks": 65, "total_marks": 100, "duration_weeks": 4,
    },
    {
        "level_number": 3,
        "title": "Pre-Intermediate – Three Digits",
        "description": "Three-digit operations and introduction to multiplication tables on abacus.",
        "topics": ["Three-digit addition", "Three-digit subtraction", "Multiplication intro", "Times tables 2–5", "Speed building"],
        "passing_marks": 65, "total_marks": 100, "duration_weeks": 5,
    },
    {
        "level_number": 4,
        "title": "Intermediate – Multiplication",
        "description": "Multiplication of 2-digit × 1-digit, 2-digit × 2-digit and division basics.",
        "topics": ["2×1 multiplication", "2×2 multiplication", "Division intro", "Long division basics", "Mental maths warm-up"],
        "passing_marks": 70, "total_marks": 100, "duration_weeks": 5,
    },
    {
        "level_number": 5,
        "title": "Upper-Intermediate – Division",
        "description": "Full division operations and multi-digit multiplication with speed practice.",
        "topics": ["3×1 division", "3×2 division", "Multi-digit multiplication", "Flash Anzan basics (5 numbers)", "Mental calculation drills"],
        "passing_marks": 70, "total_marks": 100, "duration_weeks": 6,
    },
    {
        "level_number": 6,
        "title": "Advanced – Speed & Accuracy",
        "description": "Speed arithmetic, Flash Anzan up to 10 numbers and complex operations.",
        "topics": ["Speed addition (10 rows)", "Flash Anzan (10 numbers)", "Complex division", "Decimal operations", "Competition-style problems"],
        "passing_marks": 75, "total_marks": 100, "duration_weeks": 6,
    },
    {
        "level_number": 7,
        "title": "Expert – Large Numbers",
        "description": "Operations with large numbers, decimals and fractions using mental abacus.",
        "topics": ["6-digit operations", "Decimal fractions", "Percentage calculations", "Flash Anzan (15 numbers, 0.3 s)", "Mental abacus mastery"],
        "passing_marks": 80, "total_marks": 100, "duration_weeks": 8,
    },
    {
        "level_number": 8,
        "title": "Master – Mental Abacus",
        "description": "Full mental abacus computation without physical device at competition speed.",
        "topics": ["Pure mental abacus", "Flash Anzan (20 numbers, 0.2 s)", "All four operations mentally", "Competition preparation", "Grand Master techniques"],
        "passing_marks": 85, "total_marks": 100, "duration_weeks": 8,
    },
]


def _seed_database():
    db = SessionLocal()
    try:
        # Seed admin user
        if not db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first():
            admin = User(
                full_name=settings.FIRST_ADMIN_NAME,
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.admin,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"[Seed] Admin user created: {settings.FIRST_ADMIN_EMAIL}")

        # Seed syllabus levels
        for data in SYLLABUS_SEED:
            if not db.query(SyllabusLevel).filter(SyllabusLevel.level_number == data["level_number"]).first():
                db.add(SyllabusLevel(
                    level_number=data["level_number"],
                    title=data["title"],
                    description=data["description"],
                    topics_json=json.dumps(data["topics"]),
                    passing_marks=data["passing_marks"],
                    total_marks=data["total_marks"],
                    duration_weeks=data["duration_weeks"],
                ))
        db.commit()
        print("[Seed] Syllabus levels seeded.")
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    _seed_database()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Abacus Learning & Competition Management System",
    lifespan=lifespan,
)

# Run initialization once on startup
try:
    init_db()
except Exception as e:
    print(f"[Init Warning] Database init: {e}")

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------
API_PREFIX = "/api"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(students.router, prefix=API_PREFIX)
app.include_router(syllabus.router, prefix=API_PREFIX)
app.include_router(exams.router, prefix=API_PREFIX)
app.include_router(results.router, prefix=API_PREFIX)
app.include_router(competitions.router, prefix=API_PREFIX)
app.include_router(leaderboard.router, prefix=API_PREFIX)
app.include_router(practice.router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

