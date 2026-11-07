from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserPublic
from app.services.auth_service import register_user, login_user, refresh_tokens
from app.core.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserPublic, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and receive access + refresh tokens."""
    return login_user(db, payload)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a refresh token for a new token pair."""
    return refresh_tokens(db, payload.refresh_token)


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's public profile."""
    return current_user

