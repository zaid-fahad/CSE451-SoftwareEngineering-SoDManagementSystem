from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.model.user import User
from app.schemas.semester import (
    SemesterResponse,
    SemesterCreate,
    SemesterUpdate,
    SemesterStatsResponse
)
from app.services.semesters import (
    get_all_semesters,
    get_active_semester,
    create_semester,
    update_semester,
    archive_semester,
    get_semester_stats
)
from app.services.security import require_role

router = APIRouter(prefix="/semesters", tags=["Semesters & Onboarding"])

@router.get("", response_model=List[SemesterResponse])
async def list_semesters(db: AsyncSession = Depends(get_db)):
    """Retrieve all academic semesters."""
    return await get_all_semesters(db)

@router.get("/active", response_model=SemesterResponse)
async def read_active_semester(db: AsyncSession = Depends(get_db)):
    """Retrieve the currently active semester."""
    active = await get_active_semester(db)
    if not active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active semester found.")
    return active

@router.post("", response_model=SemesterResponse, status_code=status.HTTP_201_CREATED)
async def create_new_semester(
    data: SemesterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["DeptManager"]))
):
    """Create a new semester. Restricted to Department Managers."""
    return await create_semester(data, db)

@router.patch("/{id}", response_model=SemesterResponse)
async def patch_semester(
    id: int,
    data: SemesterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["DeptManager"]))
):
    """Update semester properties, including active state and onboarding toggle."""
    return await update_semester(id, data, db)

@router.post("/{id}/archive", response_model=SemesterResponse)
async def archive_existing_semester(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["DeptManager"]))
):
    """Conclude and archive an academic semester. Marks it permanently read-only and inactive."""
    return await archive_semester(id, db)

@router.get("/{id}/stats", response_model=SemesterStatsResponse)
async def read_semester_stats(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["DeptManager", "LabManager", "Faculty"]))
):
    """Get statistics for a semester (onboarded students, duties, billing claims)."""
    return await get_semester_stats(id, db)
