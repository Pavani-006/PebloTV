import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_db
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # 1. Check DB connection
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    # 2. Check storage directory accessibility
    storage_status = "ok"
    try:
        os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
        test_file = os.path.join(settings.LOCAL_STORAGE_PATH, ".health_check")
        with open(test_file, "w") as f:
            f.write("ok")
        if os.path.exists(test_file):
            os.remove(test_file)
    except Exception as e:
        storage_status = f"error: {str(e)}"

    is_healthy = db_status == "ok" and storage_status == "ok"

    if not is_healthy:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "database": db_status,
                "storage": storage_status
            }
        )

    return {
        "status": "healthy",
        "database": db_status,
        "storage": storage_status,
        "catalog_path": settings.CATALOG_STORAGE_PATH
    }
