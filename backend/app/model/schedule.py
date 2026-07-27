from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String, nullable=False)  # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    start_time = Column(String, nullable=False)  # HH:MM (24h format, e.g. "09:00")
    end_time = Column(String, nullable=False)  # HH:MM (24h format, e.g. "11:00")
    course_code = Column(String, nullable=True)  # e.g., "PHY101"
    is_override = Column(Boolean, default=False, nullable=False)  # True if manually set by student

    # Relationship to user model
    student = relationship("User", backref="schedules")
