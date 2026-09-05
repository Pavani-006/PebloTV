import os
import json
from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List, Any
from app.config import settings

router = APIRouter(prefix="/catalog", tags=["Public Catalog"])

def load_current_catalog():
    filepath = os.path.join(settings.CATALOG_STORAGE_PATH, "current.json")
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public catalog not available yet. Please trigger an initial publish."
        )
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("")
@router.get("/")
@router.get("/current")
@router.get("/current.json")
def get_catalog():
    """Returns the current live published catalog."""
    return load_current_catalog()


@router.get("/search")
def search_catalog(
    q: Optional[str] = Query(None, description="Free-text search across titles, synopsis, categories"),
    category: Optional[str] = Query(None, description="Filter by category"),
    language: Optional[str] = Query(None, description="Filter by available language (e.g. en, hi)"),
    section: Optional[str] = Query(None, description="Filter by section (e.g. featured, series)")
):
    catalog = load_current_catalog()
    results = []

    for sec in catalog.get("sections", []):
        sec_name = sec.get("name")
        if section and sec_name.lower() != section.lower():
            continue

        for show in sec.get("shows", []):
            # Category filter
            if category:
                show_cats = [c.lower() for c in show.get("category", [])]
                if category.lower() not in show_cats:
                    continue

            # Check text query match on show
            q_lower = q.lower() if q else ""
            show_match = (
                not q or
                q_lower in show.get("title", "").lower() or
                q_lower in show.get("synopsis", "").lower() or
                any(q_lower in c.lower() for c in show.get("category", []))
            )

            # Filter seasons / episodes matching language and search query
            matched_seasons = []
            for season in show.get("seasons", []):
                matched_episodes = []
                for group in season.get("episodes", []):
                    langs = group.get("languages", [])
                    if language and language.lower() not in [l.lower() for l in langs]:
                        continue
                    
                    ep_match = (
                        show_match or
                        q_lower in group.get("title", "").lower() or
                        q_lower in group.get("description", "").lower()
                    )
                    if ep_match:
                        matched_episodes.append(group)

                if matched_episodes:
                    season_copy = season.copy()
                    season_copy["episodes"] = matched_episodes
                    matched_seasons.append(season_copy)

            if show_match or matched_seasons:
                show_copy = show.copy()
                if matched_seasons:
                    show_copy["seasons"] = matched_seasons
                results.append(show_copy)

    return {
        "query": q,
        "filters": {"category": category, "language": language, "section": section},
        "count": len(results),
        "results": results
    }
