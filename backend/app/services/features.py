import os
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.model.feature_flag import FeatureFlag

DEFAULT_FEATURES = [
    {
        "key": "demo_mode",
        "name": "Demo Mode & Role Switcher",
        "description": "Displays interactive demo role bar, schedule mock filler, and quick-tap simulation badges.",
        "category": "System",
        "default_enabled": False,
    },
    {
        "key": "user_registration",
        "name": "Public User Registration",
        "description": "Enables public self-registration portal (/register) for student assistants.",
        "category": "System",
        "default_enabled": False,
    },
    {
        "key": "shift_swaps",
        "name": "Shift Swap Broadcast Engine",
        "description": "Permits student assistants to trade duty assignments and peer broadcast swap requests.",
        "category": "Workflows",
        "default_enabled": True,
    },
    {
        "key": "billing_claims",
        "name": "Billing & Payroll Pipeline",
        "description": "Allows duty hours billing claims submission, manager approvals, and payroll CSV exports.",
        "category": "Workflows",
        "default_enabled": True,
    },
    {
        "key": "rfid_kiosk",
        "name": "RFID Attendance Kiosk",
        "description": "Provides dedicated full-screen RFID kiosk terminal and card tap check-in/out logging.",
        "category": "Hardware",
        "default_enabled": True,
    },
    {
        "key": "iras_schedule_parser",
        "name": "IRAS Timetable Regex Parser",
        "description": "Enables automated regular expression parsing of raw university class schedules.",
        "category": "Academic",
        "default_enabled": True,
    },
]

def get_env_default(key: str, default: bool) -> bool:
    env_var = f"FEATURE_{key.upper()}"
    val = os.getenv(env_var)
    if val is not None:
        return val.strip().lower() in ("true", "1", "yes", "on")
    return default

async def init_feature_flags(db: AsyncSession) -> None:
    """Initialize feature flags in the database if they do not exist."""
    for item in DEFAULT_FEATURES:
        key = item["key"]
        result = await db.execute(select(FeatureFlag).where(FeatureFlag.key == key))
        flag = result.scalars().first()
        if not flag:
            initial_enabled = get_env_default(key, item["default_enabled"])
            new_flag = FeatureFlag(
                key=key,
                name=item["name"],
                description=item["description"],
                category=item["category"],
                enabled=initial_enabled,
                updated_at=datetime.now(timezone.utc)
            )
            db.add(new_flag)
    await db.commit()

async def get_all_feature_flags(db: AsyncSession) -> List[FeatureFlag]:
    """Retrieve all feature flags ordered by category and key."""
    result = await db.execute(select(FeatureFlag).order_by(FeatureFlag.category, FeatureFlag.key))
    flags = result.scalars().all()
    if not flags:
        await init_feature_flags(db)
        result = await db.execute(select(FeatureFlag).order_by(FeatureFlag.category, FeatureFlag.key))
        flags = result.scalars().all()
    return list(flags)

async def get_feature_flags_map(db: AsyncSession) -> Dict[str, bool]:
    """Return dictionary of { flag_key: is_enabled }."""
    flags = await get_all_feature_flags(db)
    return {f.key: f.enabled for f in flags}

async def is_feature_enabled(key: str, db: AsyncSession) -> bool:
    """Check if a specific feature flag is enabled."""
    result = await db.execute(select(FeatureFlag).where(FeatureFlag.key == key))
    flag = result.scalars().first()
    if flag is not None:
        return flag.enabled
    
    # Fallback to default definition if not found
    for item in DEFAULT_FEATURES:
        if item["key"] == key:
            return get_env_default(key, item["default_enabled"])
    return False

async def update_feature_flag(key: str, enabled: bool, db: AsyncSession) -> FeatureFlag:
    """Update state of a feature flag."""
    result = await db.execute(select(FeatureFlag).where(FeatureFlag.key == key))
    flag = result.scalars().first()
    if not flag:
        raise HTTPException(status_code=404, detail=f"Feature flag '{key}' not found.")
    
    flag.enabled = enabled
    flag.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(flag)
    return flag

async def update_feature_flags_bulk(updates: Dict[str, bool], db: AsyncSession) -> List[FeatureFlag]:
    """Bulk update multiple feature flags."""
    for key, enabled in updates.items():
        result = await db.execute(select(FeatureFlag).where(FeatureFlag.key == key))
        flag = result.scalars().first()
        if flag:
            flag.enabled = enabled
            flag.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return await get_all_feature_flags(db)

async def reset_feature_flags(db: AsyncSession) -> List[FeatureFlag]:
    """Reset all feature flags to initial system/environment defaults."""
    for item in DEFAULT_FEATURES:
        key = item["key"]
        result = await db.execute(select(FeatureFlag).where(FeatureFlag.key == key))
        flag = result.scalars().first()
        initial_enabled = get_env_default(key, item["default_enabled"])
        if flag:
            flag.enabled = initial_enabled
            flag.updated_at = datetime.now(timezone.utc)
        else:
            new_flag = FeatureFlag(
                key=key,
                name=item["name"],
                description=item["description"],
                category=item["category"],
                enabled=initial_enabled,
                updated_at=datetime.now(timezone.utc)
            )
            db.add(new_flag)
    await db.commit()
    return await get_all_feature_flags(db)

def require_feature(feature_key: str):
    """FastAPI route dependency to block execution if a feature is disabled."""
    async def dependency(db: AsyncSession = Depends(get_db)):
        enabled = await is_feature_enabled(feature_key, db)
        if not enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature_key}' is currently disabled by system administrator."
            )
    return dependency
