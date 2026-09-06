import pytest

from app.services.seed_service import validate_seed_items


def test_seed_data_rejects_duplicate_content_group_language():
    items = [
        {"content_group": "show-s01e01", "language": "en"},
        {"content_group": "show-s01e01", "language": "hi"},
        {"content_group": "show-s01e01", "language": "en"},
    ]

    with pytest.raises(ValueError, match="Duplicate seed episode key"):
        validate_seed_items(items)


def test_seed_data_accepts_multilingual_variants():
    validate_seed_items([
        {"content_group": "show-s01e01", "language": "en"},
        {"content_group": "show-s01e01", "language": "hi"},
    ])