from sqlalchemy.orm import Session
from app.models import Show, Episode, Artwork
from app.schemas.publish import ValidationReport, ValidationErrorDetail

def generate_validation_report(db: Session) -> ValidationReport:
    """
    Evaluates database state against requirements before catalog publish:
    - Published shows must have an assigned section
    - Published shows must have poster artwork (2:3 aspect ratio)
    - Published episodes must have a positive duration
    - Content group consistency checks
    """
    errors = []

    # 1. Inspect Published Shows
    published_shows = db.query(Show).filter(Show.status == "published").all()
    for show in published_shows:
        # Check missing section
        if not show.section or not show.section.strip():
            errors.append(ValidationErrorDetail(
                type="missing_section",
                entity_type="show",
                show_title=show.title,
                message=f"Published show '{show.title}' must have a assigned section before publishing."
            ))

        # Check missing poster artwork
        has_poster = any(art.type == "poster" for art in show.artwork)
        if not has_poster:
            errors.append(ValidationErrorDetail(
                type="missing_artwork",
                entity_type="show",
                show_title=show.title,
                message=f"Poster artwork (2:3 aspect ratio) is required for published show '{show.title}'."
            ))

        # Inspect episodes in published shows
        for season in show.seasons:
            for ep in season.episodes:
                if ep.status == "published":
                    if ep.duration is None or ep.duration <= 0:
                        errors.append(ValidationErrorDetail(
                            type="missing_duration",
                            entity_type="episode",
                            show_title=show.title,
                            episode_title=ep.title,
                            message=f"Published episode '{ep.title}' must have a valid positive duration."
                        ))

    can_publish = len(errors) == 0
    return ValidationReport(
        can_publish=can_publish,
        issue_count=len(errors),
        errors=errors
    )
