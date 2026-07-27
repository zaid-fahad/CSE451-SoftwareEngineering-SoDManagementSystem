from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class BillingClaim(Base):
    __tablename__ = "billing_claims"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month = Column(String, nullable=False)  # e.g., "July 2026"
    hours_logged = Column(Float, nullable=False)
    hourly_rate = Column(Float, default=150.0, nullable=False)  # Default rate in BDT/USD
    status = Column(String, default="Pending", nullable=False)  # Pending, Verified, Approved, Paid
    amount = Column(Float, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))

    # Relationships
    student = relationship("User", backref="billing_claims")
