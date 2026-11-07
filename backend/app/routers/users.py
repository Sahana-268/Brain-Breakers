from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Student, Teacher, UserRole
from app.schemas.auth import UserPublic
from app.schemas.user import UserUpdate, PasswordChange, StudentProfileUpdate, TeacherProfileUpdate
from app.core.dependencies import get_current_user, require_teacher_or_admin, require_admin
from app.core.security import verify_password, hash_password
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserPublic)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_my_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password", status_code=204)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()


@router.patch("/me/student-profile", response_model=UserPublic)
def update_student_profile(
    payload: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise HTTPException(status_code=403, detail="Only students can update student profiles.")
    student = current_user.student_profile
    if not student:
        raise NotFoundException("Student profile not found.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/teacher-profile", response_model=UserPublic)
def update_teacher_profile(
    payload: TeacherProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.teacher:
        raise HTTPException(status_code=403, detail="Only teachers can update teacher profiles.")
    teacher = current_user.teacher_profile
    if not teacher:
        raise NotFoundException("Teacher profile not found.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(teacher, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/", response_model=List[UserPublic])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: list all users."""
    return db.query(User).all()


@router.patch("/{user_id}/toggle-active", response_model=UserPublic)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found.")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

