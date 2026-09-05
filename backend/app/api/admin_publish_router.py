from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models import PublishRun
from app.schemas.publish import ValidationReport, PublishRunResponse
from app.services.validation import generate_validation_report
from app.services.publish_service import publish_catalog
from app.auth.dependencies import require_editor, require_admin

router = APIRouter(prefix="/admin", tags=["Admin Publishing"])

@router.get("/validation-report", response_model=ValidationReport)
def get_validation_report(db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    return generate_validation_report(db)

@router.post("/catalog/publish", response_model=PublishRunResponse)
def trigger_publish(db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    run_record = publish_catalog(db, triggered_by=current_user.get("sub", "admin"))
    if run_record.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": run_record.error_message,
                "publish_run_id": run_record.id
            }
        )
    return run_record

@router.get("/catalog/history", response_model=List[PublishRunResponse])
def get_publish_history(db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    return db.query(PublishRun).order_by(PublishRun.started_at.desc()).all()
