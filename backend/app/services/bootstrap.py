import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.model.user import User
from app.services.security import hash_password

logger = logging.getLogger(__name__)

async def bootstrap_admin_user(session: AsyncSession) -> None:
    """
    Idempotently creates the initial administrator / department manager account
    if FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD environment variables are set.
    """
    email = settings.FIRST_ADMIN_EMAIL
    password = settings.FIRST_ADMIN_PASSWORD

    if not email or not password:
        logger.info("FIRST_ADMIN_EMAIL or FIRST_ADMIN_PASSWORD not set. Skipping initial admin bootstrap.")
        return

    result = await session.execute(select(User).where(User.email == email))
    existing_user = result.scalars().first()

    if existing_user:
        logger.info("Admin user '%s' already exists. Skipping creation.", email)
        return

    logger.info("Bootstrapping initial admin user: %s (role: %s)", email, settings.FIRST_ADMIN_ROLE)
    admin_user = User(
        name=settings.FIRST_ADMIN_NAME,
        email=email,
        department_id=settings.FIRST_ADMIN_DEPT_ID,
        hashed_password=hash_password(password),
        role=settings.FIRST_ADMIN_ROLE,
        is_active=True,
        approval_status="Approved",
        weekly_hours_limit=40.0
    )
    session.add(admin_user)
    await session.commit()
    logger.info("Successfully bootstrapped admin user '%s'.", email)
