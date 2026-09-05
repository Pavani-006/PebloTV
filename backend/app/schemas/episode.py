from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EpisodeBase(BaseModel):
    episode_number: int
    title: str
    description: Optional[str] = None
    duration: Optional[int] = None
    language: str = "en"
    content_group: str
    status: str = "draft"

class EpisodeCreate(EpisodeBase):
    season_id: str

class EpisodeUpdate(BaseModel):
    episode_number: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    language: Optional[str] = None
    content_group: Optional[str] = None
    status: Optional[str] = None

class EpisodeResponse(EpisodeBase):
    id: str
    season_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
