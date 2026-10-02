from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.model.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
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
        role="Student"  # Enforces default Student role
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

    db.add(target_user)
    await db.commit()
    await db.refresh(target_user)
    return target_user


