from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import secrets
from datetime import datetime, timedelta
from app.database import get_db
from app.model.user import User
from app.model.invite_token import InviteToken
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
    UserAdminUpdate,
    UserProfileUpdate,
    UserProfileResponse,
    ChangePasswordRequest,
    AdminResetPasswordRequest,
    FacultyRegisterRequest,
    InviteTokenResponse,
    InviteTokenValidateResponse,
)
from app.services.security import hash_password, verify_password, create_access_token
from app.services.features import require_feature

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature("user_registration"))])
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    email_result = await db.execute(select(User).where(User.email == user_data.email))
    if email_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Check if department_id already exists
    dep_result = await db.execute(select(User).where(User.department_id == user_data.department_id))
    if dep_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this Department ID already exists."
        )

    # Hash the password
    hashed = hash_password(user_data.password)

    # Create new User model instance
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        department_id=user_data.department_id,
        hashed_password=hashed,
        role="Student",  # Enforces default Student role
        approval_status="Pending"  # Requires manager approval
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalars().first()

    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

from typing import List

@router.get("/students", response_model=List[UserResponse])
async def list_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == "Student"))
    return result.scalars().all()

from app.services.security import get_current_user, create_access_token
from app.schemas.user import UserProfileUpdate, ChangePasswordRequest, UserProfileResponse, AdminResetPasswordRequest, UserAdminUpdate

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if changing email and email belongs to someone else
    email_changed = profile_data.email != current_user.email
    if email_changed:
        email_check = await db.execute(select(User).where(User.email == profile_data.email))
        if email_check.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use by another account."
            )

    current_user.name = profile_data.name
    current_user.email = profile_data.email
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    # Issue a fresh access token for the updated email/sub
    new_token = create_access_token(data={"sub": current_user.email, "role": current_user.role})

    return {
        "user": current_user,
        "access_token": new_token,
        "token_type": "bearer"
    }

@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    current_user.hashed_password = hash_password(password_data.new_password)
    db.add(current_user)
    await db.commit()
    return {"status": "success", "message": "Password changed successfully."}

@router.post("/users/{user_id}/reset-password", response_model=dict)
async def admin_reset_user_password(
    user_id: int,
    reset_data: AdminResetPasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "DeptManager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Department Managers can reset user passwords."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalars().first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found."
        )

    target_user.hashed_password = hash_password(reset_data.new_password)
    db.add(target_user)
    await db.commit()
    return {"status": "success", "message": f"Password for {target_user.name} has been updated successfully."}

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["DeptManager", "LabManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can access the full user directory."
        )
    result = await db.execute(select(User))
    return result.scalars().all()

@router.put("/users/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: int,
    update_data: UserAdminUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "DeptManager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Department Managers can update user accounts and limits."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalars().first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found.")

    if update_data.name is not None:
        target_user.name = update_data.name
    if update_data.email is not None:
        target_user.email = update_data.email
    if update_data.department_id is not None:
        target_user.department_id = update_data.department_id
    if update_data.role is not None:
        target_user.role = update_data.role
    if update_data.is_active is not None:
        target_user.is_active = update_data.is_active
    if update_data.rfid_tag is not None:
        target_user.rfid_tag = update_data.rfid_tag
    if update_data.weekly_hours_limit is not None:
        target_user.weekly_hours_limit = update_data.weekly_hours_limit
    if update_data.approval_status is not None:
        target_user.approval_status = update_data.approval_status

    db.add(target_user)
    await db.commit()
    await db.refresh(target_user)
    return target_user

@router.get("/pending-students", response_model=List[UserResponse])
async def list_pending_students(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["DeptManager", "LabManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can access pending registrations."
        )

    result = await db.execute(
        select(User).where((User.role == "Student") & (User.approval_status == "Pending"))
    )
    return result.scalars().all()

@router.get("/pending-faculty", response_model=List[UserResponse])
async def list_pending_faculty(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["DeptManager", "LabManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can access pending registrations."
        )

    result = await db.execute(
        select(User).where((User.role == "Faculty") & (User.approval_status == "Pending"))
    )
    return result.scalars().all()

@router.post("/students/{user_id}/approve", response_model=UserResponse)
async def approve_student_registration(
    user_id: int,
    weekly_hours_limit: Optional[float] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await approve_user_registration(user_id=user_id, weekly_hours_limit=weekly_hours_limit, current_user=current_user, db=db)

@router.post("/users/{user_id}/approve", response_model=UserResponse)
async def approve_user_registration(
    user_id: int,
    weekly_hours_limit: Optional[float] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["DeptManager", "LabManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can approve registrations."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalars().first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    target_user.approval_status = "Approved"
    if weekly_hours_limit is not None and target_user.role == "Student":
        target_user.weekly_hours_limit = weekly_hours_limit

    db.add(target_user)
    await db.commit()
    await db.refresh(target_user)
    return target_user

@router.post("/students/{user_id}/reject", response_model=dict)
async def reject_student_registration(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await reject_user_registration(user_id=user_id, current_user=current_user, db=db)

@router.post("/users/{user_id}/reject", response_model=dict)
async def reject_user_registration(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["DeptManager", "LabManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can reject registrations."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalars().first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    target_user.approval_status = "Rejected"
    db.add(target_user)
    await db.commit()
    return {"status": "success", "message": f"Registration for {target_user.name} has been rejected."}

@router.post("/invites/faculty", response_model=InviteTokenResponse)
async def create_faculty_invite(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "DeptManager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Department Managers can generate faculty invite links."
        )

    token_str = secrets.token_urlsafe(24)
    now = datetime.utcnow()
    created_at = now.strftime("%Y-%m-%d %H:%M:%S")
    expires_at = (now + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")

    invite = InviteToken(
        token=token_str,
        role="Faculty",
        created_by=current_user.id,
        created_at=created_at,
        expires_at=expires_at,
        is_used=False
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)

    return InviteTokenResponse(
        token=token_str,
        role="Faculty",
        invite_url=f"/register/faculty?token={token_str}",
        expires_at=expires_at
    )

@router.get("/invites/validate", response_model=InviteTokenValidateResponse)
async def validate_faculty_invite(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(InviteToken).where(InviteToken.token == token))
    invite = result.scalars().first()
    if not invite:
        return InviteTokenValidateResponse(
            valid=False,
            role="Faculty",
            message="Invalid invite token."
        )

    if invite.is_used:
        return InviteTokenValidateResponse(
            valid=False,
            role=invite.role,
            message="This invite token has already been used."
        )

    if invite.expires_at:
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        if invite.expires_at < now_str:
            return InviteTokenValidateResponse(
                valid=False,
                role=invite.role,
                expires_at=invite.expires_at,
                message="This invite token has expired."
            )

    return InviteTokenValidateResponse(
        valid=True,
        role=invite.role,
        expires_at=invite.expires_at,
        message="Valid invite token."
    )

@router.post("/register/faculty", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_faculty(
    req: FacultyRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(InviteToken).where(InviteToken.token == req.token))
    invite = result.scalars().first()
    if not invite or invite.role != "Faculty":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invite token for faculty registration."
        )

    if invite.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invite token has already been used."
        )

    if invite.expires_at:
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        if invite.expires_at < now_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invite token has expired."
            )

    # Check email and department_id duplicates
    email_result = await db.execute(select(User).where(User.email == req.email))
    if email_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    dep_result = await db.execute(select(User).where(User.department_id == req.department_id))
    if dep_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this Department ID already exists."
        )

    hashed = hash_password(req.password)
    new_user = User(
        name=req.name,
        email=req.email,
        department_id=req.department_id,
        hashed_password=hashed,
        role="Faculty",
        approval_status="Pending"
    )

    invite.is_used = True
    db.add(invite)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


