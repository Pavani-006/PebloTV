from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models import Season, Show
from app.schemas.season import SeasonCreate, SeasonResponse
from app.auth.dependencies import require_editor

router = APIRouter(prefix="/admin/seasons", tags=["Admin Seasons"])

@router.get("/show/{show_id}", response_model=List[SeasonResponse])
def list_seasons_for_show(show_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    return db.query(Season).filter(Season.show_id == show_id).order_by(Season.season_number).all()

@router.post("", response_model=SeasonResponse, status_code=status.HTTP_201_CREATED)
def create_season(payload: SeasonCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    show = db.query(Show).filter(Show.id == payload.show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
        
    existing = db.query(Season).filter(Season.show_id == payload.show_id, Season.season_number == payload.season_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Season {payload.season_number} already exists for this show")

    season = Season(**payload.model_dump())
    db.add(season)
    db.commit()
    db.refresh(season)
    return season
