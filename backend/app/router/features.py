from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.model.user import User
from app.schemas.feature_flag import FeatureFlagResponse, FeatureFlagUpdate, FeatureFlagsSummary, FeatureFlagsBulkUpdate
from app.services.features import (
    get_all_feature_flags,
    get_feature_flags_map,
    update_feature_flag,
    update_feature_flags_bulk,
    reset_feature_flags
)
from app.services.security import require_role

router = APIRouter(prefix="/features", tags=["Feature Flags"])

@router.get("", response_model=FeatureFlagsSummary)
async def list_features(db: AsyncSession = Depends(get_db)):
    """Publicly retrieve the active state and metadata of all system feature flags."""
    flags_map = await get_feature_flags_map(db)
    details = await get_all_feature_flags(db)
    return FeatureFlagsSummary(flags=flags_map, details=details)

@router.patch("/{key}", response_model=FeatureFlagResponse)
async def update_feature(
    key: str,
    update_data: FeatureFlagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["DeptManager"]))
):
    """Enable or disable a specific feature flag. Restricted to Department Managers."""
    return await update_feature_flag(key, update_data.enabled, db)

@router.put("", response_model=FeatureFlagsSummary)
async def bulk_update_features(
    update_data: FeatureFlagsBulkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["DeptManager"]))
):
    """Bulk update multiple feature flags at once. Restricted to Department Managers."""
    await update_feature_flags_bulk(update_data.flags, db)
    flags_map = await get_feature_flags_map(db)
    details = await get_all_feature_flags(db)
    return FeatureFlagsSummary(flags=flags_map, details=details)

@router.post("/reset", response_model=List[FeatureFlagResponse])
async def reset_features(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["DeptManager"]))
):
    """Reset all feature flags to initial system defaults. Restricted to Department Managers."""
    return await reset_feature_flags(db)
