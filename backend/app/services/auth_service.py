import random
import string
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User, Student, Teacher, UserRole
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.exceptions import ConflictException, BadRequestException
from jose import JWTError


def _generate_enrollment() -> str:
    """Generate a unique enrollment number like BB2026-XXXXX."""
    year = datetime.utcnow().year
    suffix = "".join(random.choices(string.digits, k=5))
    return f"BB{year}-{suffix}"


def register_user(db: Session, payload: RegisterRequest) -> User:
    # Check duplicate email
    if db.query(User).filter(User.email == payload.email).first():
        raise ConflictException("An account with this email already exists.")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
    )
    db.add(user)
    db.flush()  # get user.id before commit

    # Create role-specific profile
    if payload.role == UserRole.student:
        # Ensure enrollment number uniqueness
        enrollment = _generate_enrollment()
        while db.query(Student).filter(Student.enrollment_number == enrollment).first():
            enrollment = _generate_enrollment()
        db.add(Student(user_id=user.id, enrollment_number=enrollment))

    elif payload.role == UserRole.teacher:
        db.add(Teacher(user_id=user.id))

    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, payload: LoginRequest) -> dict:
    user = db.query(User).filter(User.email == payload.email, User.is_active == True).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise BadRequestException("Invalid email or password.")

    sub = str(user.id)
    access_token = create_access_token({"sub": sub, "role": user.role.value})
    refresh_token = create_refresh_token({"sub": sub, "role": user.role.value})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": user.id,
        "full_name": user.full_name,
    }


def refresh_tokens(db: Session, refresh_token: str) -> dict:
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise BadRequestException("Invalid token type.")
        user_id = payload.get("sub")
    except JWTError:
        raise BadRequestException("Invalid or expired refresh token.")

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise BadRequestException("User not found.")

    sub = str(user.id)
    return {
        "access_token": create_access_token({"sub": sub, "role": user.role.value}),
        "refresh_token": create_refresh_token({"sub": sub, "role": user.role.value}),
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": user.id,
        "full_name": user.full_name,
    }

