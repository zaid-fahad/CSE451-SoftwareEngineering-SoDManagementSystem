from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Duty(Base):
    __tablename__ = "duties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)  # e.g., "Lab Duty", "Exam Support", "Faculty Task"
    date = Column(String, nullable=False)  # YYYY-MM-DD
    day_of_week = Column(String, nullable=False)  # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    start_time = Column(String, nullable=False)  # HH:MM
    end_time = Column(String, nullable=False)  # HH:MM
    assigned_student_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String, default="Assigned", nullable=False)  # Assigned, Completed, Verified, Approved
    notes = Column(String, nullable=True)

    # Relationships
    assigned_student = relationship("User", backref="duties")
