import os
import json
import io
from PIL import Image
from sqlalchemy.orm import Session
from app.models import Show, Season, Episode, Artwork
from app.storage import get_storage

def create_sample_artwork_file(width: int, height: int, color: tuple) -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def seed_database_if_empty(db: Session, seed_json_path: str):
    existing_shows = db.query(Show).count()
    if existing_shows > 0:
        return

    if not os.path.exists(seed_json_path):
        return

    with open(seed_json_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    storage = get_storage()

    # Pre-generate sample artwork bytes
    poster_bytes = create_sample_artwork_file(600, 900, (41, 128, 185))
    banner_bytes = create_sample_artwork_file(1280, 720, (142, 68, 173))
    thumb_bytes = create_sample_artwork_file(640, 360, (39, 174, 96))

    shows_map = {} # title -> Show
    seasons_map = {} # (show_title, season_number) -> Season

    for item in raw_items:
        show_title = item.get("show_title")
        if not show_title:
            continue

        # 1. Show setup
        if show_title not in shows_map:
            show = Show(
                title=show_title,
                slug=item.get("slug", show_title.lower().replace(" ", "-")),
                synopsis=item.get("synopsis"),
                section=item.get("section"),
                category=item.get("categories", []),
                status="published" if item.get("section") else "draft"
            )
            db.add(show)
            db.flush()

            # Seed Show Artwork if requested
            art_types = item.get("artwork_available", [])
            if "poster" in art_types:
                buf = io.BytesIO(poster_bytes)
                key = storage.save(buf, f"show_{show.id}_poster.jpg")
                art = Artwork(show_id=show.id, type="poster", storage_key=key, width=600, height=900, size_bytes=len(poster_bytes), mime_type="image/jpeg")
                db.add(art)
            if "banner" in art_types:
                buf = io.BytesIO(banner_bytes)
                key = storage.save(buf, f"show_{show.id}_banner.jpg")
                art = Artwork(show_id=show.id, type="banner", storage_key=key, width=1280, height=720, size_bytes=len(banner_bytes), mime_type="image/jpeg")
                db.add(art)

            shows_map[show_title] = show

        show = shows_map[show_title]

        # 2. Season setup
        season_num = item.get("season_number", 1)
        s_key = (show_title, season_num)
        if s_key not in seasons_map:
            season = Season(
                show_id=show.id,
                season_number=season_num,
                title=f"Season {season_num}" if season_num > 0 else "Trailers & Extras"
            )
            db.add(season)
            db.flush()
            seasons_map[s_key] = season

        season = seasons_map[s_key]

        # 3. Episode setup
        ep = Episode(
            season_id=season.id,
            episode_number=item.get("episode_number", 1),
            title=item.get("episode_title", "Untitled Episode"),
            description=f"Description for {item.get('episode_title')}",
            duration=item.get("duration_seconds"),
            language=item.get("language", "en"),
            content_group=item.get("content_group"),
            status=item.get("status", "draft")
        )
        db.add(ep)
        db.flush()

        # Episode Artwork
        art_types = item.get("artwork_available", [])
        if "thumbnail" in art_types:
            buf = io.BytesIO(thumb_bytes)
            key = storage.save(buf, f"ep_{ep.id}_thumb.jpg")
            art = Artwork(episode_id=ep.id, type="thumbnail", storage_key=key, width=640, height=360, size_bytes=len(thumb_bytes), mime_type="image/jpeg")
            db.add(art)

    db.commit()
