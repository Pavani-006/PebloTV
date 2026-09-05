from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ValidationErrorDetail(BaseModel):
    type: str
    entity_type: str
    show_title: Optional[str] = None
    episode_title: Optional[str] = None
    message: str

class ValidationReport(BaseModel):
    can_publish: bool
    issue_count: int
    errors: List[ValidationErrorDetail]

class PublishRunResponse(BaseModel):
    id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    triggered_by: str
    status: str
    show_count: int
    episode_count: int
    catalog_version: int
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
