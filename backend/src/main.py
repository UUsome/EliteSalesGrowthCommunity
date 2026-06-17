from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.config import settings
from src.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and data directory
    data_dir = Path("./data")
    data_dir.mkdir(exist_ok=True)
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    (upload_dir / "avatars").mkdir(exist_ok=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="精英销售成长社区 Elite Sales Growth Community",
    description="销售社区系统 - 发现、智库、人才集市、同行交流",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
from src.auth.router import router as auth_router
from src.experts.router import router as experts_router
from src.jobs.router import router as jobs_router
from src.posts.router import router as posts_router
from src.content.router import router as content_router
from src.discovery.router import router as discovery_router
from src.users.router import router as users_router
from src.admin.router import router as admin_router

app.include_router(auth_router)
app.include_router(experts_router)
app.include_router(jobs_router)
app.include_router(posts_router)
app.include_router(content_router)
app.include_router(discovery_router)
app.include_router(users_router)
app.include_router(admin_router)


@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "精英销售成长社区"}
