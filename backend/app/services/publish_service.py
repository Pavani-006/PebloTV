import os
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import Show, Season, Episode, Artwork, PublishRun
from app.services.validation import generate_validation_report
from app.config import settings
from app.storage import get_storage

def publish_catalog(db: Session, triggered_by: str = "admin") -> PublishRun:
    """
    Executes the atomic, deterministic catalogue publishing pipeline:
    1. Validation check
    2. Data filtering & transformation (Season 0 trailer extraction, content_group language merging)
    3. Deterministic sorting
    4. Immutable versioned file creation & atomic swap of current.json pointer
    5. Audit logging in publish_runs table
    """
    start_time = datetime.now(timezone.utc)
    
    # 1. Validation Check
    report = generate_validation_report(db)
    if not report.can_publish:
        run_record = PublishRun(
            started_at=start_time,
            completed_at=datetime.now(timezone.utc),
            triggered_by=triggered_by,
            status="failed",
            show_count=0,
            episode_count=0,
            error_message=f"Validation failed with {report.issue_count} blocking errors.",
            catalog_version=0
        )
        db.add(run_record)
        db.commit()
        db.refresh(run_record)
        return run_record

    # 2. Get Next Version Number
    last_run = db.query(PublishRun).filter(PublishRun.status == "success").order_by(PublishRun.catalog_version.desc()).first()
    next_version = (last_run.catalog_version + 1) if last_run else 1

    # 3. Query Published Content
    published_shows = (
        db.query(Show)
        .filter(Show.status == "published")
        .all()
    )

    storage = get_storage()

    sections_dict = {}
    total_shows_published = 0
    total_episodes_published = 0

    for show in published_shows:
        section_name = show.section or "General"
        if section_name not in sections_dict:
            sections_dict[section_name] = []

        # Artwork mapping
        show_artwork = {
            a.type: storage.get_url(a.storage_key) for a in show.artwork
        }

        trailers = []
        seasons_list = []

        for season in show.seasons:
            # Published episodes only
            published_episodes = [ep for ep in season.episodes if ep.status == "published"]
            if not published_episodes:
                continue

            if season.season_number == 0:
                # Season 0 -> Trailers / Promos
                for ep in published_episodes:
                    ep_art = {a.type: storage.get_url(a.storage_key) for a in ep.artwork}
                    trailers.append({
                        "id": ep.id,
                        "title": ep.title,
                        "description": ep.description,
                        "duration": ep.duration,
                        "language": ep.language,
                        "content_group": ep.content_group,
                        "artwork": ep_art
                    })
                    total_episodes_published += 1
            else:
                # Standard Season: Group episodes by content_group
                groups_dict = {}
                for ep in published_episodes:
                    cg = ep.content_group
                    total_episodes_published += 1
                    if cg not in groups_dict:
                        groups_dict[cg] = {
                            "content_group": cg,
                            "title": ep.title,
                            "description": ep.description,
                            "duration": ep.duration,
                            "languages": [],
                            "variants": [],
                            "artwork": {a.type: storage.get_url(a.storage_key) for a in ep.artwork}
                        }
                    
                    if ep.language not in groups_dict[cg]["languages"]:
                        groups_dict[cg]["languages"].append(ep.language)
                    
                    groups_dict[cg]["variants"].append({
                        "id": ep.id,
                        "language": ep.language,
                        "title": ep.title,
                        "description": ep.description
                    })

                # Sort content group items deterministically
                grouped_episodes = list(groups_dict.values())
                grouped_episodes.sort(key=lambda x: (x["title"], x["content_group"]))

                seasons_list.append({
                    "season_number": season.season_number,
                    "title": season.title,
                    "episodes": grouped_episodes
                })

        # Sort seasons by season_number
        seasons_list.sort(key=lambda s: s["season_number"])

        show_data = {
            "id": show.id,
            "title": show.title,
            "synopsis": show.synopsis,
            "category": show.category,
            "section": show.section,
            "artwork": show_artwork,
            "trailers": trailers,
            "seasons": seasons_list
        }

        sections_dict[section_name].append(show_data)
        total_shows_published += 1

    # 4. Deterministic Sorting of Sections & Shows
    sorted_sections = []
    for s_name in sorted(sections_dict.keys()):
        shows_in_section = sections_dict[s_name]
        shows_in_section.sort(key=lambda x: x["title"])
        sorted_sections.append({
            "name": s_name,
            "shows": shows_in_section
        })

    catalog_data = {
        "catalog_version": next_version,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "show_count": total_shows_published,
            "episode_count": total_episodes_published
        },
        "sections": sorted_sections
    }

    # 5. Write Catalog Files & Atomic Pointer Replacement
    catalog_dir = settings.CATALOG_STORAGE_PATH
    versions_dir = os.path.join(catalog_dir, "versions")
    os.makedirs(versions_dir, exist_ok=True)

    version_filename = f"catalog-{next_version}.json"
    version_filepath = os.path.join(versions_dir, version_filename)
    current_filepath = os.path.join(catalog_dir, "current.json")
    tmp_filepath = os.path.join(catalog_dir, "current.json.tmp")

    json_content = json.dumps(catalog_data, indent=2, ensure_ascii=False)

    # Write immutable versioned snapshot
    with open(version_filepath, "w", encoding="utf-8") as f:
        f.write(json_content)

    # Write to temporary file in target directory
    with open(tmp_filepath, "w", encoding="utf-8") as f:
        f.write(json_content)

    # Atomic rename / replace
    os.replace(tmp_filepath, current_filepath)

    # 6. Audit Log Entry
    completed_time = datetime.now(timezone.utc)
    run_record = PublishRun(
        started_at=start_time,
        completed_at=completed_time,
        triggered_by=triggered_by,
        status="success",
        show_count=total_shows_published,
        episode_count=total_episodes_published,
        catalog_version=next_version,
        error_message=None
    )
    db.add(run_record)
    db.commit()
    db.refresh(run_record)

    return run_record
