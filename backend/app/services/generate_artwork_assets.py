import io
import math
from PIL import Image, ImageDraw, ImageFont

def create_rich_poster(title: str, category: str, primary_color: tuple, secondary_color: tuple) -> bytes:
    W, H = 600, 900
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)

    # 1. Multi-color gradient background
    r1, g1, b1 = primary_color
    r2, g2, b2 = secondary_color
    for y in range(H):
        ratio = y / H
        r = int(r1 * (1 - ratio) + r2 * ratio)
        g = int(g1 * (1 - ratio) + g2 * ratio)
        b = int(b1 * (1 - ratio) + b2 * ratio)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # 2. Decorative geometric shapes & glowing circles
    draw.ellipse([W - 200, -50, W + 100, 250], fill=None, outline=(255, 255, 255, 40), width=6)
    draw.ellipse([-80, H - 350, 250, H - 20], fill=None, outline=(255, 255, 255, 30), width=8)

    # Decorative central emblem / icon circle
    cx, cy = W // 2, H // 2 - 80
    draw.ellipse([cx - 100, cy - 100, cx + 100, cy + 100], fill=(255, 255, 255, 25), outline=(255, 255, 255, 80), width=3)
    draw.polygon([(cx - 20, cy - 30), (cx + 35, cy), (cx - 20, cy + 30)], fill=(255, 255, 255, 220))

    # 3. Top Badge: "PEBLO ORIGINAL"
    draw.rectangle([W//2 - 90, 40, W//2 + 90, 70], fill=(124, 58, 237), outline=(236, 72, 153), width=2)
    draw.text((W//2, 55), "PEBLO ORIGINAL", fill=(255, 255, 255), anchor="mm")

    # 4. Dark Bottom Vignette
    for y in range(H - 350, H):
        alpha = int(240 * ((y - (H - 350)) / 350))
        draw.line([(0, y), (W, y)], fill=(11, 15, 25, alpha))

    # 5. Title Text & Subtitle
    # Wrapping title into lines
    words = title.split()
    line1 = " ".join(words[:2]) if len(words) >= 2 else title
    line2 = " ".join(words[2:]) if len(words) > 2 else ""

    draw.text((W // 2, H - 180), line1.upper(), fill=(255, 255, 255), anchor="mm")
    if line2:
        draw.text((W // 2, H - 130), line2.upper(), fill=(236, 72, 153), anchor="mm")

    # Category Tag
    draw.rectangle([W//2 - 60, H - 75, W//2 + 60, H - 50], fill=(255, 255, 255, 40), outline=(255, 255, 255, 100), width=1)
    draw.text((W // 2, H - 62), category.upper(), fill=(226, 232, 240), anchor="mm")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

def create_rich_banner(title: str, section: str, primary_color: tuple, secondary_color: tuple) -> bytes:
    W, H = 1280, 720
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)

    # 1. Diagonal gradient
    r1, g1, b1 = primary_color
    r2, g2, b2 = secondary_color
    for x in range(W):
        ratio = x / W
        r = int(r1 * (1 - ratio) + r2 * ratio)
        g = int(g1 * (1 - ratio) + g2 * ratio)
        b = int(b1 * (1 - ratio) + b2 * ratio)
        draw.line([(x, 0), (x, H)], fill=(r, g, b))

    # 2. Glowing background rings
    draw.ellipse([W - 450, H // 2 - 250, W - 50, H // 2 + 150], outline=(255, 255, 255, 50), width=5)
    draw.polygon([(W - 250, H//2 - 50), (W - 150, H//2), (W - 250, H//2 + 50)], fill=(255, 255, 255, 200))

    # 3. Left vignette for text legibility
    for x in range(0, W // 2 + 200):
        alpha = int(220 * (1 - (x / (W // 2 + 200))))
        draw.line([(x, 0), (x, H)], fill=(7, 9, 14, alpha))

    # 4. Text Branding
    draw.rectangle([80, 100, 260, 132], fill=(236, 72, 153))
    draw.text((170, 116), f"PEBLO {section.upper()}", fill=(255, 255, 255), anchor="mm")

    draw.text((80, 220), title, fill=(255, 255, 255), anchor="lm")
    draw.text((80, 270), "STREAMING NOW ON PEBLO TV", fill=(203, 213, 225), anchor="lm")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

def create_rich_thumbnail(title: str, ep_num: int, primary_color: tuple) -> bytes:
    W, H = 640, 360
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)

    r1, g1, b1 = primary_color
    for y in range(H):
        ratio = y / H
        r = int(r1 * (1 - ratio * 0.5))
        g = int(g1 * (1 - ratio * 0.5))
        b = int(b1 * (1 - ratio * 0.5))
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Play Icon Circle
    cx, cy = W // 2, H // 2 - 20
    draw.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(0, 0, 0, 120), outline=(255, 255, 255, 200), width=3)
    draw.polygon([(cx - 10, cy - 18), (cx + 18, cy), (cx - 10, cy + 18)], fill=(255, 255, 255, 240))

    # Bottom Title Bar
    draw.rectangle([0, H - 70, W, H], fill=(11, 15, 25, 220))
    draw.text((20, H - 45), f"EPISODE {ep_num} • {title}", fill=(255, 255, 255), anchor="lm")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()
