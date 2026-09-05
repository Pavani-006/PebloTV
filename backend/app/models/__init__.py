import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Table, UniqueConstraint, Text, JSON
from sqlalchemy.orm import relationship
from app.db import Base

def generate_uuid():
    return str(uuid.uuid4())

class Show(Base):
    __tablename__ = "shows"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    synopsis = Column(Text, nullable=True)
    section = Column(String, nullable=True, index=True) # e.g. "featured", "series", "minisodes", "songs"
    category = Column(JSON, default=list) # e.g. ["adventure", "india"]
    status = Column(String, default="draft") # "draft" or "published"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    seasons = relationship("Season", back_populates="show", cascade="all, delete-orphan", order_by="Season.season_number")
    artwork = relationship("Artwork", back_populates="show", cascade="all, delete-orphan")

class Season(Base):
    __tablename__ = "seasons"

    id = Column(String, primary_key=True, default=generate_uuid)
    show_id = Column(String, ForeignKey("shows.id"), nullable=False)
    season_number = Column(Integer, nullable=False)
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    show = relationship("Show", back_populates="seasons")
    episodes = relationship("Episode", back_populates="season", cascade="all, delete-orphan", order_by="Episode.episode_number")

    __table_args__ = (
        UniqueConstraint("show_id", "season_number", name="uix_show_season"),
    )

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(String, primary_key=True, default=generate_uuid)
    season_id = Column(String, ForeignKey("seasons.id"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True) # Duration in seconds
    language = Column(String, nullable=False, default="en") # "en", "hi", etc.
    content_group = Column(String, nullable=False, index=True) # Multi-language variant grouping
    status = Column(String, default="draft") # "draft" or "published"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    season = relationship("Season", back_populates="episodes")
    artwork = relationship("Artwork", back_populates="episode", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("content_group", "language", name="uix_content_group_language"),
    )

class Artwork(Base):
    __tablename__ = "artwork"

    id = Column(String, primary_key=True, default=generate_uuid)
    show_id = Column(String, ForeignKey("shows.id"), nullable=True)
    episode_id = Column(String, ForeignKey("episodes.id"), nullable=True)
    type = Column(String, nullable=False) # "poster" (2:3), "banner" (16:9), "thumbnail" (16:9)
    storage_key = Column(String, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    show = relationship("Show", back_populates="artwork")
    episode = relationship("Episode", back_populates="artwork")

class PublishRun(Base):
    __tablename__ = "publish_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    triggered_by = Column(String, default="admin")
    status = Column(String, nullable=False) # "success" or "failed"
    show_count = Column(Integer, default=0)
    episode_count = Column(Integer, default=0)
    catalog_version = Column(Integer, default=1)
    error_message = Column(Text, nullable=True)
