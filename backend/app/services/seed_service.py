import os
import json
import io
import hashlib
from PIL import Image
from PIL import ImageDraw
from sqlalchemy.orm import Session
from app.models import Show, Season, Episode, Artwork
from app.storage import get_storage

def validate_seed_items(raw_items: list[dict]) -> None:
    seen_keys = set()
    for index, item in enumerate(raw_items):
        key = (item.get("content_group"), item.get("language", "en"))
        if key in seen_keys:
            raise ValueError(
                f"Duplicate seed episode key at row {index}: "
                f"content_group={key[0]!r}, language={key[1]!r}"
            )
        seen_keys.add(key)

def create_sample_artwork_file(width: int, height: int, color: tuple, label: str = "") -> bytes:
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    accent = tuple(min(channel + 55, 255) for channel in color)
    for y in range(height):
        ratio = y / max(height - 1, 1)
        row_color = tuple(int(color[i] * (1 - ratio) + accent[i] * ratio) for i in range(3))
        draw.line((0, y, width, y), fill=row_color)
    if label:
        draw.text((width * 0.06, height * 0.82), label[:28], fill="white")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def color_for_key(key: str) -> tuple:
    digest = hashlib.md5(key.encode("utf-8")).digest()
    return tuple(45 + (digest[index] % 120) for index in range(3))

def purple_color_for_key(key: str) -> tuple:
    digest = hashlib.md5(key.encode("utf-8")).digest()
    return (70 + (digest[0] % 65), 35 + (digest[1] % 40), 125 + (digest[2] % 90))

def seed_database_if_empty(db: Session, seed_json_path: str):
    existing_shows = db.query(Show).count()
    if existing_shows > 0:
        return

    if not os.path.exists(seed_json_path):
        return

    with open(seed_json_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    validate_seed_items(raw_items)

    storage = get_storage()
    existing_episode_keys = {
        (content_group, language)
        for content_group, language in db.query(Episode.content_group, Episode.language).all()
    }

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
            show_color = color_for_key(show_title)
            if "poster" in art_types:
                poster_bytes = create_sample_artwork_file(600, 900, show_color, show_title)
                buf = io.BytesIO(poster_bytes)
                key = storage.save(buf, f"show_{show.id}_poster.jpg")
                art = Artwork(show_id=show.id, type="poster", storage_key=key, width=600, height=900, size_bytes=len(poster_bytes), mime_type="image/jpeg")
                db.add(art)
            if "banner" in art_types:
                banner_bytes = create_sample_artwork_file(1280, 720, show_color, show_title)
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
        episode_key = (item.get("content_group"), item.get("language", "en"))
        if episode_key in existing_episode_keys:
            continue

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
        existing_episode_keys.add(episode_key)

        # Episode Artwork
        art_types = item.get("artwork_available", [])
        if "thumbnail" in art_types:
            thumb_bytes = create_sample_artwork_file(640, 360, purple_color_for_key(item.get("content_group", ep.id)), item.get("episode_title", ""))
            buf = io.BytesIO(thumb_bytes)
            key = storage.save(buf, f"ep_{ep.id}_thumb.jpg")
            art = Artwork(episode_id=ep.id, type="thumbnail", storage_key=key, width=640, height=360, size_bytes=len(thumb_bytes), mime_type="image/jpeg")
            db.add(art)

    db.commit()
