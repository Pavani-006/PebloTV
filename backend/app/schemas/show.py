from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ShowBase(BaseModel):
    title: str
    slug: str
    synopsis: Optional[str] = None
    section: Optional[str] = None
    category: List[str] = []
    status: str = "draft"

class ShowCreate(ShowBase):
    pass

class ShowUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    synopsis: Optional[str] = None
    section: Optional[str] = None
    category: Optional[List[str]] = None
    status: Optional[str] = None

class ShowResponse(ShowBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
