from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base

class Semester(Base):
    __tablename__ = "semesters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # e.g., "Autumn 2026"
    code = Column(String, unique=True, index=True, nullable=False)  # e.g., "AUT26"
    is_active = Column(Boolean, default=False, nullable=False)
    is_onboarding_open = Column(Boolean, default=False, nullable=False)
    start_date = Column(String, nullable=True)  # YYYY-MM-DD
    end_date = Column(String, nullable=True)    # YYYY-MM-DD
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
