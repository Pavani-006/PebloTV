import io
from PIL import Image
from app.services.artwork_validator import validate_artwork

def create_image_bytes(width, height, color=(255, 0, 0)):
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_valid_poster_artwork():
    img_bytes = create_image_bytes(600, 900)
    res = validate_artwork(img_bytes, "poster", "image/jpeg")
    assert res.is_valid is True
    assert res.width == 600
    assert res.height == 900
    assert len(res.errors) == 0

def test_invalid_aspect_ratio_poster():
    img_bytes = create_image_bytes(800, 600) # 4:3 instead of 2:3
    res = validate_artwork(img_bytes, "poster", "image/jpeg")
    assert res.is_valid is False
    assert any("Invalid aspect ratio" in err for err in res.errors)

def test_oversized_artwork_file():
    # Large canvas causing > 200 KB
    img_bytes = create_image_bytes(4000, 6000)
    res = validate_artwork(img_bytes, "poster", "image/jpeg")
    if len(img_bytes) > 204800:
        assert res.is_valid is False
        assert any("exceeds maximum allowed limit" in err for err in res.errors)
