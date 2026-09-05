from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models import Episode, Season
from app.schemas.episode import EpisodeCreate, EpisodeUpdate, EpisodeResponse
from app.auth.dependencies import require_editor

router = APIRouter(prefix="/admin/episodes", tags=["Admin Episodes"])

@router.get("/season/{season_id}", response_model=List[EpisodeResponse])
def list_episodes_for_season(season_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    return db.query(Episode).filter(Episode.season_id == season_id).order_by(Episode.episode_number).all()

@router.post("", response_model=EpisodeResponse, status_code=status.HTTP_201_CREATED)
def create_episode(payload: EpisodeCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    season = db.query(Season).filter(Season.id == payload.season_id).first()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    # Composite unique check (content_group, language)
    existing_group_lang = db.query(Episode).filter(
        Episode.content_group == payload.content_group,
        Episode.language == payload.language
    ).first()
    if existing_group_lang:
        raise HTTPException(status_code=400, detail=f"Episode variant with content_group '{payload.content_group}' and language '{payload.language}' already exists")

    episode = Episode(**payload.model_dump())
    db.add(episode)
    db.commit()
    db.refresh(episode)
    return episode

@router.put("/{episode_id}", response_model=EpisodeResponse)
def update_episode(episode_id: str, payload: EpisodeUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(episode, k, v)

    db.commit()
    db.refresh(episode)
    return episode

@router.delete("/{episode_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_episode(episode_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    db.delete(episode)
    db.commit()
    return None
