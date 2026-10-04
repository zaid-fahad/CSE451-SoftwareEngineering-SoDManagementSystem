from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sod_db"
    JWT_SECRET: str = "supersecretkeychangeinproduction"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Production CORS configuration
    CORS_ORIGINS: str = "*"
    CORS_ALLOW_CLOUDFLARE_PAGES: bool = True

    # Initial Admin / DeptManager Bootstrap credentials
    FIRST_ADMIN_EMAIL: Optional[str] = None
    FIRST_ADMIN_PASSWORD: Optional[str] = None
    FIRST_ADMIN_NAME: str = "Department Administrator"
    FIRST_ADMIN_DEPT_ID: str = "ADMIN-0001"
    FIRST_ADMIN_ROLE: str = "DeptManager"

    model_config = ConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
