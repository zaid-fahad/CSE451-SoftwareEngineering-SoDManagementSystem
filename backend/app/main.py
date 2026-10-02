from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup in development
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure recently added columns exist in SQLite development databases without requiring manual migrations
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE users ADD COLUMN rfid_tag VARCHAR"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE users ADD COLUMN weekly_hours_limit FLOAT DEFAULT 10.0 NOT NULL"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE users ADD COLUMN approval_status VARCHAR DEFAULT 'Approved' NOT NULL"))
        except Exception:
            pass
        for col_def in [
            "ALTER TABLE billing_claims ADD COLUMN week_number INTEGER",
            "ALTER TABLE billing_claims ADD COLUMN verified_by VARCHAR",
            "ALTER TABLE billing_claims ADD COLUMN verified_at VARCHAR",
            "ALTER TABLE billing_claims ADD COLUMN approved_by VARCHAR",
            "ALTER TABLE billing_claims ADD COLUMN approved_at VARCHAR",
            "ALTER TABLE billing_claims ADD COLUMN paid_by VARCHAR",
            "ALTER TABLE billing_claims ADD COLUMN paid_at VARCHAR",
            "ALTER TABLE billing_claims ADD COLUMN dispute_reason VARCHAR",
        ]:
            try:
                from sqlalchemy import text
                await conn.execute(text(col_def))
            except Exception:
                pass

    async with AsyncSessionLocal() as session:
        await init_feature_flags(session)
        await init_semesters(session)
    yield

app = FastAPI(
    title="Departmental SoD Management System API",
    description="Backend services for academic schedule parsing, duty assignments, and billing pipelines.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
