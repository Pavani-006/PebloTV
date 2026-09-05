import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.db import engine, Base, SessionLocal
from app.api import (
    auth_router,
    admin_shows_router,
    admin_seasons_router,
    admin_episodes_router,
    admin_artwork_router,
    admin_publish_router,
    public_catalog_router,
    health_router
)
from app.services.seed_service import seed_database_if_empty
from app.services.publish_service import publish_catalog

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Peblo TV Mini Backend API with Atomic Publishing, CMS, and Public Catalog search",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.LOCAL_STORAGE_PATH), name="media")

app.include_router(auth_router.router)
app.include_router(admin_shows_router.router)
app.include_router(admin_seasons_router.router)
app.include_router(admin_episodes_router.router)
app.include_router(admin_artwork_router.router)
app.include_router(admin_publish_router.router)
app.include_router(public_catalog_router.router)
app.include_router(public_catalog_router.router, prefix="/api/v1")
app.include_router(public_catalog_router.router, prefix="/api")
app.include_router(health_router.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    
    seed_path = os.getenv("SEED_FILE_PATH", os.path.abspath("../data/seed_shows.json"))
    if not os.path.exists(seed_path):
        seed_path = os.path.abspath("./data/seed_shows.json")
    
    db = SessionLocal()
    try:
        seed_database_if_empty(db, seed_path)
        # Attempt auto-publish if catalog is empty
        catalog_current = os.path.join(settings.CATALOG_STORAGE_PATH, "current.json")
        if not os.path.exists(catalog_current):
            try:
                publish_catalog(db, triggered_by="system-init")
            except Exception:
                pass
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Peblo TV Mini API active",
        "docs": "/docs",
        "health": "/health"
    }
