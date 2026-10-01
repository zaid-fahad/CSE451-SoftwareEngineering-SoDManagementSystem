from datetime import datetime
from pydantic import BaseModel
from typing import Dict, List

class FeatureFlagResponse(BaseModel):
    key: str
    name: str
    description: str
    category: str
    enabled: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class FeatureFlagUpdate(BaseModel):
    enabled: bool

class FeatureFlagsSummary(BaseModel):
    flags: Dict[str, bool]
    details: List[FeatureFlagResponse]

class FeatureFlagsBulkUpdate(BaseModel):
    flags: Dict[str, bool]
