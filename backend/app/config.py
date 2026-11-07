from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Brain Breakers Academy"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:5173"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite:///./brainbreakers.db"

    # Admin Bootstrap
    FIRST_ADMIN_EMAIL: str = "admin@brainbreakers.com"
    FIRST_ADMIN_PASSWORD: str = "Admin@1234"
    FIRST_ADMIN_NAME: str = "System Admin"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

