from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.router.auth import router as auth_router
from app.router.schedule import router as schedule_router
from app.router.duty import router as duty_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup in development
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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

@app.get("/")
async def root():
    return {
        "project": "Departmental SoD Management System",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
