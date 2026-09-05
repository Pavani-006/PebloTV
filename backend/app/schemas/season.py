from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SeasonBase(BaseModel):
    season_number: int
    title: Optional[str] = None

class SeasonCreate(SeasonBase):
    show_id: str

class SeasonResponse(SeasonBase):
    id: str
    show_id: str
    created_at: datetime

    class Config:
        from_attributes = True
