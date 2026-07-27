from app.router.auth import router as auth_router
from app.router.schedule import router as schedule_router
from app.router.duty import router as duty_router
from app.router.swap import router as swap_router, notif_router

__all__ = ["auth_router", "schedule_router", "duty_router", "swap_router", "notif_router"]
