import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db import get_db
from app.models import Artwork, Show, Episode
from app.schemas.artwork import ArtworkValidationResult, ArtworkResponse
from app.services.artwork_validator import validate_artwork
from app.storage import get_storage
from app.auth.dependencies import require_editor

router = APIRouter(prefix="/admin/artwork", tags=["Admin Artwork"])

@router.post("/validate", response_model=ArtworkValidationResult)
async def validate_artwork_endpoint(
    type: str = Form(...),
    file: UploadFile = File(...)
):
    contents = await file.read()
    return validate_artwork(contents, type, file.content_type)

@router.post("/upload", response_model=ArtworkResponse, status_code=status.HTTP_201_CREATED)
async def upload_artwork(
    type: str = Form(...),
    show_id: Optional[str] = Form(None),
    episode_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_editor)
):
    if not show_id and not episode_id:
        raise HTTPException(status_code=400, detail="Must link artwork to either a show_id or an episode_id")

    contents = await file.read()
    val_res = validate_artwork(contents, type, file.content_type)
    if not val_res.is_valid:
        raise HTTPException(status_code=400, detail={"message": "Artwork validation failed", "errors": val_res.errors})

    # Save to storage
    storage = get_storage()
    file_obj = io.BytesIO(contents)
    storage_key = storage.save(file_obj, file.filename or f"artwork_{type}.jpg")

    # Remove existing artwork of same type for entity if exists
    if show_id:
        existing = db.query(Artwork).filter(Artwork.show_id == show_id, Artwork.type == type).all()
        for old in existing:
            storage.delete(old.storage_key)
            db.delete(old)
    elif episode_id:
        existing = db.query(Artwork).filter(Artwork.episode_id == episode_id, Artwork.type == type).all()
        for old in existing:
            storage.delete(old.storage_key)
            db.delete(old)

    art = Artwork(
        show_id=show_id,
        episode_id=episode_id,
        type=type,
        storage_key=storage_key,
        width=val_res.width,
        height=val_res.height,
        size_bytes=val_res.size_bytes,
        mime_type=file.content_type
    )
    db.add(art)
    db.commit()
    db.refresh(art)

    url = storage.get_url(art.storage_key)
    return ArtworkResponse(
        id=art.id,
        show_id=art.show_id,
        episode_id=art.episode_id,
        type=art.type,
        url=url,
        width=art.width,
        height=art.height,
        size_bytes=art.size_bytes
    )
