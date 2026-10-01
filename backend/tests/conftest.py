import asyncio
import pytest
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.database import Base, get_db
from app.main import app

# Test database URL (SQLite In-Memory)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create async engine for test db
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize feature flags and semesters enabled for general test suite
    from app.services.features import init_feature_flags, get_all_feature_flags
    from app.services.semesters import init_semesters
    async with TestSessionLocal() as session:
        await init_feature_flags(session)
        flags = await get_all_feature_flags(session)
        for f in flags:
            f.enabled = True
        await init_semesters(session)
        await session.commit()

    yield
    # Drop tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture(autouse=True)
def override_get_db(db: AsyncSession):
    async def _get_db():
        yield db
    app.dependency_overrides[get_db] = _get_db
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(autouse=True)
async def reset_test_feature_flags(db: AsyncSession):
    from app.services.features import get_all_feature_flags
    from app.services.semesters import init_semesters, get_all_semesters
    flags = await get_all_feature_flags(db)
    for f in flags:
        f.enabled = True
    await init_semesters(db)
    sems = await get_all_semesters(db)
    for s in sems:
        if s.name == "Autumn 2026":
            s.is_active = True
            s.is_onboarding_open = True
    await db.commit()
    yield
