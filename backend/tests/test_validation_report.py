import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db import Base
from app.models import Show, Season, Episode, Artwork
from app.services.validation import generate_validation_report

@pytest.fixture
def memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

def test_validation_report_blocking_errors(memory_db):
    # Show without section & artwork
    show = Show(title="Drafty Show", slug="drafty", section=None, status="published")
    memory_db.add(show)
    memory_db.flush()

    season = Season(show_id=show.id, season_number=1)
    memory_db.add(season)
    memory_db.flush()

    # Episode without duration
    ep = Episode(season_id=season.id, episode_number=1, title="No Duration", duration=0, status="published", content_group="cg")
    memory_db.add(ep)
    memory_db.commit()

    report = generate_validation_report(memory_db)
    assert report.can_publish is False
    assert report.issue_count == 3

    err_types = [e.type for e in report.errors]
    assert "missing_section" in err_types
    assert "missing_artwork" in err_types
    assert "missing_duration" in err_types
