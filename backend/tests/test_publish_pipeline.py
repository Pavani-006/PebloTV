import os
import json
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db import Base
from app.models import Show, Season, Episode, Artwork
from app.services.publish_service import publish_catalog
from app.config import settings

@pytest.fixture
def db_session(tmp_path, monkeypatch):
    test_db = os.path.join(tmp_path, "test.db")
    engine = create_engine(f"sqlite:///{test_db}")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    
    catalog_dir = os.path.join(tmp_path, "catalog")
    media_dir = os.path.join(tmp_path, "media")
    monkeypatch.setattr(settings, "CATALOG_STORAGE_PATH", catalog_dir)
    monkeypatch.setattr(settings, "LOCAL_STORAGE_PATH", media_dir)

    yield db

    db.close()

def test_atomic_publish_flow(db_session, tmp_path):
    # Setup valid show
    show = Show(title="Test Show", slug="test-show", section="featured", status="published", category=["action"])
    db_session.add(show)
    db_session.flush()

    art = Artwork(show_id=show.id, type="poster", storage_key="poster.jpg")
    db_session.add(art)

    season1 = Season(show_id=show.id, season_number=1, title="Season 1")
    db_session.add(season1)
    db_session.flush()

    # Multi-language episodes with same content_group
    ep1 = Episode(season_id=season1.id, episode_number=1, title="Ep 1", duration=300, language="en", content_group="cg-1", status="published")
    ep2 = Episode(season_id=season1.id, episode_number=1, title="Ep 1", duration=310, language="hi", content_group="cg-1", status="published")
    db_session.add_all([ep1, ep2])
    db_session.commit()

    run = publish_catalog(db_session, triggered_by="admin")
    assert run.status == "success"
    assert run.catalog_version == 1

    current_file = os.path.join(settings.CATALOG_STORAGE_PATH, "current.json")
    assert os.path.exists(current_file)

    with open(current_file, "r") as f:
        data = json.load(f)

    assert data["catalog_version"] == 1
    assert len(data["sections"]) == 1
    sec = data["sections"][0]
    assert sec["name"] == "featured"
    assert len(sec["shows"]) == 1
    
    s_data = sec["shows"][0]
    ep_group = s_data["seasons"][0]["episodes"][0]
    assert ep_group["content_group"] == "cg-1"
    assert "en" in ep_group["languages"]
    assert "hi" in ep_group["languages"]
