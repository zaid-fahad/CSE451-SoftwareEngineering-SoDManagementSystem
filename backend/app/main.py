from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router.auth import router as auth_router

app = FastAPI(
    title="Departmental SoD Management System API",
    description="Backend services for academic schedule parsing, duty assignments, and billing pipelines.",
    version="1.0.0"
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

@app.get("/")
async def root():
    return {
        "project": "Departmental SoD Management System",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
