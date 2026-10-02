from sqlalchemy import Column, Integer, String, Boolean, Float
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Student", nullable=False)  # Student, Faculty, LabManager, DeptManager
    is_active = Column(Boolean, default=True, nullable=False)
    rfid_tag = Column(String, nullable=True)
    weekly_hours_limit = Column(Float, default=10.0, nullable=False)
    approval_status = Column(String, default="Approved", nullable=False)  # Pending, Approved, Rejected
