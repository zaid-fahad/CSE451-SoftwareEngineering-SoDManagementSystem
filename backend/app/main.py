import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.database import Base, engine, AsyncSessionLocal
from app.router.auth import router as auth_router
from app.router.schedule import router as schedule_router
from app.router.duty import router as duty_router
from app.router.swap import router as swap_router, notif_router
from app.router.billing import router as billing_router
from app.router.features import router as features_router
from app.router.semesters import router as semesters_router
from app.services.features import init_feature_flags
from app.services.semesters import init_semesters
from app.services.bootstrap import bootstrap_admin_user

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist (Alembic handles migrations, create_all provides fallback)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        await init_feature_flags(session)
        await init_semesters(session)
        await bootstrap_admin_user(session)
    yield

app = FastAPI(
    title="Departmental SoD Management System API",
    description="Backend services for academic schedule parsing, duty assignments, and billing pipelines.",
    version="1.0.0",
    lifespan=lifespan
)

# Parse CORS allowed origins
cors_origins_raw = settings.CORS_ORIGINS.strip()
if cors_origins_raw == "*" or not cors_origins_raw:
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

cors_kwargs = {
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

if "*" in allowed_origins:
    cors_kwargs["allow_origins"] = ["*"]
    cors_kwargs["allow_credentials"] = False  # Browsers reject credentials with wildcard origin
else:
    cors_kwargs["allow_origins"] = allowed_origins
    if settings.CORS_ALLOW_CLOUDFLARE_PAGES:
        cors_kwargs["allow_origin_regex"] = r"^https://.*\.pages\.dev$"

app.add_middleware(
    CORSMiddleware,
    **cors_kwargs
)

from fastapi import Depends
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

# Healthcheck endpoints
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check(session: AsyncSession = Depends(get_db)):
    """
    Service and database connectivity health probe.
    Used by Docker healthchecks, Coolify, and monitoring services.
    """
    try:
        await session.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as exc:
        logger.error("Health check database failure: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(exc)
            }
        )

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(schedule_router, prefix="/api/v1")
app.include_router(duty_router, prefix="/api/v1")
app.include_router(swap_router, prefix="/api/v1")
app.include_router(notif_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1")
app.include_router(features_router, prefix="/api/v1")
app.include_router(semesters_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "project": "Departmental SoD Management System",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
