from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Swap(Base):
    __tablename__ = "swaps"

    id = Column(Integer, primary_key=True, index=True)
    duty_id = Column(Integer, ForeignKey("duties.id", ondelete="CASCADE"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_student_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # Null for public broadcast
    status = Column(String, default="Pending", nullable=False)  # Pending, Accepted, Rejected, Completed
    reason = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))

    # Relationships
    duty = relationship("Duty", backref="swaps")
    requester = relationship("User", foreign_keys=[requester_id], backref="requested_swaps")
    target_student = relationship("User", foreign_keys=[target_student_id], backref="received_swaps")
