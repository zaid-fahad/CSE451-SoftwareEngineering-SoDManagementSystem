from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class InviteToken(Base):
    __tablename__ = "invite_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="Faculty", nullable=False)
    created_by = Column(Integer, nullable=True)
    created_at = Column(String, nullable=False)
    expires_at = Column(String, nullable=True)
    is_used = Column(Boolean, default=False, nullable=False)
