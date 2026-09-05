from pydantic import BaseModel
from typing import Optional

class ArtworkValidationResult(BaseModel):
    is_valid: bool
    type: str
    width: Optional[int] = None
    height: Optional[int] = None
    aspect_ratio: Optional[str] = None
    size_bytes: Optional[int] = None
    errors: list[str] = []

class ArtworkResponse(BaseModel):
    id: str
    show_id: Optional[str] = None
    episode_id: Optional[str] = None
    type: str
    url: str
    width: Optional[int] = None
    height: Optional[int] = None
    size_bytes: Optional[int] = None

    class Config:
        from_attributes = True
