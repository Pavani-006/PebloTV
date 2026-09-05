from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models import Show
from app.schemas.show import ShowCreate, ShowUpdate, ShowResponse
from app.auth.dependencies import require_editor

router = APIRouter(prefix="/admin/shows", tags=["Admin Shows"])

@router.get("", response_model=List[ShowResponse])
def list_shows(db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    return db.query(Show).order_by(Show.title).all()

@router.post("", response_model=ShowResponse, status_code=status.HTTP_201_CREATED)
def create_show(payload: ShowCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    existing = db.query(Show).filter(Show.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Show with slug '{payload.slug}' already exists")
    
    show = Show(**payload.model_dump())
    db.add(show)
    db.commit()
    db.refresh(show)
    return show

@router.get("/{show_id}", response_model=ShowResponse)
def get_show(show_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return show

@router.put("/{show_id}", response_model=ShowResponse)
def update_show(show_id: str, payload: ShowUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(show, k, v)
        
    db.commit()
    db.refresh(show)
    return show

@router.delete("/{show_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_show(show_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_editor)):
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    db.delete(show)
    db.commit()
    return None
