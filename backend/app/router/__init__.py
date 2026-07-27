from app.router.auth import router as auth_router
from app.router.schedule import router as schedule_router
from app.router.duty import router as duty_router

__all__ = ["auth_router", "schedule_router", "duty_router"]
