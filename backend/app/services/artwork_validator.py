import io
from PIL import Image
from app.schemas.artwork import ArtworkValidationResult

ARTWORK_SPECS = {
    "poster": {
        "aspect_ratio": (2, 3),
        "target_dimensions": "600x900",
        "max_bytes": 204800, # 200 KB
        "allowed_mimetypes": ["image/jpeg", "image/png", "image/webp"]
    },
    "banner": {
        "aspect_ratio": (16, 9),
        "target_dimensions": "1280x720",
        "max_bytes": 204800, # 200 KB
        "allowed_mimetypes": ["image/jpeg", "image/png", "image/webp"]
    },
    "thumbnail": {
        "aspect_ratio": (16, 9),
        "target_dimensions": "640x360",
        "max_bytes": 204800, # 200 KB
        "allowed_mimetypes": ["image/jpeg", "image/png", "image/webp"]
    }
}

def validate_artwork(file_bytes: bytes, artwork_type: str, mime_type: str) -> ArtworkValidationResult:
    errors = []

    if artwork_type not in ARTWORK_SPECS:
        return ArtworkValidationResult(
            is_valid=False,
            type=artwork_type,
            errors=[f"Unknown artwork type '{artwork_type}'. Allowed types: poster, banner, thumbnail."]
        )

    spec = ARTWORK_SPECS[artwork_type]

    # File size check
    size_bytes = len(file_bytes)
    if size_bytes > spec["max_bytes"]:
        errors.append(f"File size ({size_bytes / 1024:.1f} KB) exceeds maximum allowed limit of {spec['max_bytes'] / 1024:.0f} KB.")

    # Image format check
    width, height, aspect_ratio_str = None, None, None
    try:
        image = Image.open(io.BytesIO(file_bytes))
        width, height = image.size
        
        target_w_ratio, target_h_ratio = spec["aspect_ratio"]
        expected_ratio = target_w_ratio / target_h_ratio
        actual_ratio = width / height

        # 5% tolerance for aspect ratio matching
        if abs(actual_ratio - expected_ratio) > 0.05:
            errors.append(f"Invalid aspect ratio {width}:{height} (approx {actual_ratio:.2f}). Required ratio is {target_w_ratio}:{target_h_ratio}.")
        
        aspect_ratio_str = f"{width}:{height}"
    except Exception as e:
        errors.append(f"Failed to read image metadata: {str(e)}")

    return ArtworkValidationResult(
        is_valid=len(errors) == 0,
        type=artwork_type,
        width=width,
        height=height,
        aspect_ratio=aspect_ratio_str,
        size_bytes=size_bytes,
        errors=errors
    )
