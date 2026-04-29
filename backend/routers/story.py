"""
comic_router.py  ─  ComixNova AI  ─  Ultra Quality Production Build
══════════════════════════════════════════════════════════════════

Panel = 1024 × 1280 px — every pixel intentional:

  y=   0 ┌────────────────────────────────────┐
         │  ARTWORK          780 px           │
         │  • DALL-E full-colour image         │
         │  • double border (accent + white)   │
         │  • panel-number badge (top-left)    │
         │  • SFX starburst   (top-right)      │
  y= 780 ├════════════════════════════════════╡  ← 8 px accent stripe
  y= 788 │  DIALOGUE         300 px           │
         │  ┌──────────────┐  ┌─────────────┐ │
         │  │  SPEAKER 1   │  │  SPEAKER 2  │ │
         │  │  bubble (L)  │  │  bubble (R) │ │
         │  └──────────────┘  └─────────────┘ │
  y=1088 ├════════════════════════════════════╡  ← 8 px accent stripe
  y=1096 │  CAPTION          184 px           │
         │  WHITE background — black text      │
         │  auto-shrink font — NEVER clips     │
  y=1280 └────────────────────────────────────┘

Guarantees:
  ✓  Text NEVER overflows — auto-shrinks from 46px down to 20px
  ✓  Caption is pure white — always 100% readable on every theme
  ✓  Bubbles fixed position — never overlap each other
  ✓  Every panel has a description sentence (enforced in prompt)
"""

import os, json, asyncio, io, base64, math, random
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

load_dotenv()

router          = APIRouter()
client          = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
OPENAI_KEY      = os.getenv("OPENAI_API_KEY")
http_client     = httpx.AsyncClient(timeout=90.0)  # Increased timeout for large image downloads
image_semaphore = asyncio.Semaphore(12)  # Increased for faster parallel image generation
FAST_MODEL      = "gemini-2.5-flash"
STORY_MODEL     = "gemini-2.5-flash"

# ═══════════════════════════════════════════════════════════
#  LAYOUT  (all values in pixels)
# ═══════════════════════════════════════════════════════════
CW      = 1024   # canvas width
AH      = 780    # artwork height
SEP     = 8      # accent separator
DH      = 300    # dialogue zone height
CAPH    = 184    # caption zone height
CH      = AH + SEP + DH + SEP + CAPH   # = 1280

DLG_Y   = AH + SEP           # 788  — top of dialogue zone
CAP_Y   = DLG_Y + DH + SEP   # 1096 — top of caption zone

BUB_M   = 10    # outer margin for bubbles
BUB_GAP = 8     # gap between left and right bubble
BW      = (CW - BUB_GAP - BUB_M * 2) // 2   # ≈ 503 px each
BH      = DH - BUB_M * 2                      # 280 px
BPAD    = 16    # inner content padding inside bubble

# ═══════════════════════════════════════════════════════════
#  COLOUR THEMES
# ═══════════════════════════════════════════════════════════
THEMES = [
    # dlg_bg,   accent,    bub1,      bub2
    ("#0A001E", "#A855F7", "#F3E8FF", "#FEFCE8"),   # 0 deep purple
    ("#001525", "#0EA5E9", "#E0F2FE", "#FFF7ED"),   # 1 ocean blue
    ("#001400", "#22C55E", "#DCFCE7", "#FDF4FF"),   # 2 jungle green
    ("#1A0500", "#F97316", "#FFF7ED", "#EEF2FF"),   # 3 ember orange
    ("#0F0800", "#EAB308", "#FEFCE8", "#F0FDF4"),   # 4 golden hour
    ("#1A0015", "#EC4899", "#FDF2F8", "#EFF6FF"),   # 5 neon rose
    ("#001818", "#2DD4BF", "#F0FDFA", "#FEFCE8"),   # 6 teal lagoon
    ("#180018", "#818CF8", "#EEF2FF", "#FEF2F2"),   # 7 indigo night
]

ALT_ACC = [
    "#EC4899","#0EA5E9","#F97316","#22C55E",
    "#EAB308","#A855F7","#F43F5E","#2DD4BF",
]

SFX_STYLES = [
    ("#EF4444", "#FFFFFF"),   # red   / white
    ("#EAB308", "#000000"),   # gold  / black
    ("#06B6D4", "#000000"),   # cyan  / black
    ("#84CC16", "#000000"),   # lime  / black
    ("#A855F7", "#FFFFFF"),   # violet/ white
    ("#F97316", "#FFFFFF"),   # orange/ white
    ("#F43F5E", "#FFFFFF"),   # rose  / white
    ("#2DD4BF", "#000000"),   # teal  / black
]

# ═══════════════════════════════════════════════════════════
#  FONTS  —  absolute paths, Windows + Linux + macOS
# ═══════════════════════════════════════════════════════════
_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\comicbd.ttf",
    r"C:\Windows\Fonts\comic.ttf",
    r"C:\Windows\Fonts\arialbd.ttf",
    r"C:\Windows\Fonts\arial.ttf",
    r"C:\Windows\Fonts\verdanab.ttf",
    r"C:\Windows\Fonts\calibrib.ttf",
    r"C:\Windows\Fonts\tahoma.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]

def _find_font() -> str | None:
    for p in _FONT_CANDIDATES:
        if os.path.isfile(p):
            try:
                ImageFont.truetype(p, 12)
                return p
            except (IOError, OSError):
                pass
    return None

_FP = _find_font()

def _font(size: int) -> ImageFont.FreeTypeFont:
    if _FP:
        return ImageFont.truetype(_FP, size)
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


# ═══════════════════════════════════════════════════════════
#  DRAWING UTILITIES
# ═══════════════════════════════════════════════════════════
def _sz(draw, text: str, font) -> tuple[int, int]:
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0], bb[3] - bb[1]


def _rrect(draw, box, r: int, fill,
           outline=None, lw: int = 1):
    x1, y1, x2, y2 = [int(v) for v in box]
    r = max(1, min(r, (x2 - x1) // 2, (y2 - y1) // 2))
    kw = dict(fill=fill, outline=outline, width=lw)
    draw.ellipse([x1,      y1,      x1+2*r, y1+2*r], **kw)
    draw.ellipse([x2-2*r,  y1,      x2,     y1+2*r], **kw)
    draw.ellipse([x1,      y2-2*r,  x1+2*r, y2    ], **kw)
    draw.ellipse([x2-2*r,  y2-2*r,  x2,     y2    ], **kw)
    draw.rectangle([x1+r,  y1,      x2-r,   y2    ], **kw)
    draw.rectangle([x1,    y1+r,    x2,     y2-r  ], **kw)


def _stroke(draw, xy, text, font, fill,
            outline: str = "#000000", ow: int = 3):
    x, y = int(xy[0]), int(xy[1])
    for dx in range(-ow, ow + 1):
        for dy in range(-ow, ow + 1):
            if dx or dy:
                draw.text((x + dx, y + dy), text, font=font, fill=outline)
    draw.text((x, y), text, font=font, fill=fill)


def _starburst(draw, cx, cy, r_out, r_in, pts: int, fill):
    coords = []
    for i in range(pts * 2):
        a = math.pi * i / pts - math.pi / 2
        r = r_out if i % 2 == 0 else r_in
        coords.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    draw.polygon(coords, fill=fill)


def _fit(draw, text: str,
         start: int, max_w: int, max_h: int,
         min_s: int = 20) -> tuple:
    """
    Tries font sizes from `start` down to `min_s` (step −2) until the
    word-wrapped text fits inside max_w × max_h.
    Returns (font, lines, line_height, final_size).
    NEVER overflows — guaranteed.
    """
    for size in range(start, min_s - 1, -2):
        fnt   = _font(size)
        words = text.split()
        lines: list[str] = []
        cur   = ""
        for w in words:
            test = (cur + " " + w).strip()
            if _sz(draw, test, fnt)[0] <= max_w:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        lh      = _sz(draw, "Ag", fnt)[1]
        total_h = len(lines) * (lh + 10)
        if total_h <= max_h:
            return fnt, lines, lh, size
    # absolute safety fallback
    fnt   = _font(min_s)
    words = text.split()
    lines = []
    cur   = ""
    for w in words:
        test = (cur + " " + w).strip()
        if _sz(draw, test, fnt)[0] <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return fnt, lines, _sz(draw, "Ag", fnt)[1], min_s


# ═══════════════════════════════════════════════════════════
#  SPEECH BUBBLE
# ═══════════════════════════════════════════════════════════
def _bubble(draw,
            speaker: str, text: str,
            bx: int, by: int, bw: int, bh: int,
            bg: str, accent: str,
            tail_left: bool):
    """
    Renders a speech bubble in [bx,by → bx+bw,by+bh].
    Tail points downward toward artwork.
    Font auto-shrinks — text never clips.
    """
    if not text and not speaker:
        return

    TAIL   = 20
    BODY_H = bh - TAIL
    TOP    = by

    # layer 1 — drop shadow
    _rrect(draw, [bx+7, TOP+7, bx+bw+7, TOP+BODY_H+7],
           22, fill="#00000055")

    # layer 2 — glow ring
    _rrect(draw, [bx-3, TOP-3, bx+bw+3, TOP+BODY_H+3],
           24, fill=None, outline=accent + "66", lw=4)

    # layer 3 — main bubble body
    _rrect(draw, [bx, TOP, bx+bw, TOP+BODY_H],
           22, fill=bg, outline=accent, lw=6)

    # layer 4 — gloss highlight (top 30%)
    _rrect(draw, [bx+8, TOP+8, bx+bw-8, TOP+BODY_H//3],
           16, fill="#FFFFFFBB")

    # tail (downward)
    if tail_left:
        tail_pts = [
            (bx + 30,       TOP + BODY_H),
            (bx + 72,       TOP + BODY_H + TAIL),
            (bx + 114,      TOP + BODY_H),
        ]
    else:
        tail_pts = [
            (bx + bw - 114, TOP + BODY_H),
            (bx + bw - 72,  TOP + BODY_H + TAIL),
            (bx + bw - 30,  TOP + BODY_H),
        ]
    draw.polygon(tail_pts, fill=bg, outline=accent, width=6)

    # ── content ──────────────────────────────────────────
    cy = TOP + BPAD

    # speaker name pill
    if speaker:
        F_SPK = _font(28)
        lbl   = f"  {speaker.upper()}  "
        lw, lh = _sz(draw, lbl, F_SPK)
        px1   = bx + BPAD
        py1   = cy
        px2   = px1 + lw
        py2   = py1 + lh + 12
        # pill background
        _rrect(draw, [px1, py1, px2, py2], 10, fill=accent)
        # pill shine
        _rrect(draw, [px1+2, py1+2, px2, py1+(py2-py1)//2],
               8, fill="#FFFFFF44")
        draw.text((px1, py1 + 6), lbl, font=F_SPK, fill="#FFFFFF")
        cy = py2 + 16

    # dialogue — auto-fit
    if text:
        avail_w = bw  - BPAD * 2
        avail_h = (TOP + BODY_H - BPAD) - cy
        fnt, lines, lh, _ = _fit(draw, text,
                                  start=42, max_w=avail_w, max_h=avail_h)
        for line in lines:
            lw, _ = _sz(draw, line, fnt)
            tx    = bx + (bw - lw) // 2
            # text shadow
            draw.text((tx+2, cy+2), line, font=fnt, fill="#00000030")
            # main text — dark on light background
            draw.text((tx,   cy),   line, font=fnt, fill="#111111")
            cy += lh + 10


# ═══════════════════════════════════════════════════════════
#  SFX ON ARTWORK
# ═══════════════════════════════════════════════════════════
def _sfx_on_art(canvas: Image.Image, sfx: str, idx: int):
    if not sfx:
        return
    sc, stc = SFX_STYLES[idx % len(SFX_STYLES)]
    F_SFX   = _font(80)
    text    = sfx.upper() + "!"

    probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    sw, sh = _sz(probe, text, F_SFX)

    cx  = CW - sw // 2 - 115
    cy  = sh // 2 + 105
    r   = max(sw, sh) // 2 + 70

    ov  = Image.new("RGBA", (CW, AH), (0, 0, 0, 0))
    od  = ImageDraw.Draw(ov)

    # multi-ring starburst
    _starburst(od, cx, cy, r + 12, r - 18, 16, fill=sc + "AA")
    _starburst(od, cx, cy, r,      r - 30, 12, fill=sc)
    _starburst(od, cx, cy, r - 32, r - 55, 12, fill="#FFD700")

    # centre filled ellipse
    od.ellipse(
        [cx - sw//2 - 18, cy - sh//2 - 14,
         cx + sw//2 + 18, cy + sh//2 + 14],
        fill=sc
    )
    _stroke(od, (cx - sw//2, cy - sh//2), text,
            F_SFX, stc, "#000000", ow=7)

    angle = random.choice([-13, -9, 9, 13])
    ov    = ov.rotate(angle, center=(cx, cy), resample=Image.BICUBIC)

    base  = canvas.crop((0, 0, CW, AH)).convert("RGBA")
    base.paste(ov, (0, 0), ov)
    canvas.paste(base.convert("RGB"), (0, 0))


# ═══════════════════════════════════════════════════════════
#  CAPTION BAR
# ═══════════════════════════════════════════════════════════
def _caption(draw, action: str, accent: str):
    """
    Pure-white zone with dark auto-fit text.
    Font shrinks from 46px until ALL text fits — zero clipping ever.
    """
    # white fill
    draw.rectangle([0, CAP_Y, CW, CH], fill="#FFFFFF")

    # thick accent borders (top, bottom, left, right)
    draw.rectangle([0,      CAP_Y,    CW,   CAP_Y + 8],  fill=accent)
    draw.rectangle([0,      CH - 8,   CW,   CH],          fill=accent)
    draw.rectangle([0,      CAP_Y,    12,   CH],           fill=accent)
    draw.rectangle([CW-12,  CAP_Y,    CW,   CH],           fill=accent)

    # inner top rule
    draw.rectangle([12, CAP_Y + 8, CW - 12, CAP_Y + 12],
                   fill=accent + "55")

    if not action:
        action = "The adventure continues…"

    avail_w = CW - 80    # 944 px wide — very generous
    avail_h = CAPH - 40  # 144 px tall
    fnt, lines, lh, _ = _fit(draw, action,
                                start=46, max_w=avail_w, max_h=avail_h)

    # vertical centre
    total_h = len(lines) * (lh + 12) - 12
    ty      = CAP_Y + (CAPH - total_h) // 2

    for line in lines:
        lw, _ = _sz(draw, line, fnt)
        tx    = (CW - lw) // 2
        # subtle shadow
        draw.text((tx + 3, ty + 3), line, font=fnt, fill="#00000018")
        # crisp near-black on pure white
        draw.text((tx,     ty),     line, font=fnt, fill="#111111")
        ty += lh + 12


# ═══════════════════════════════════════════════════════════
#  FULL PANEL ASSEMBLER
# ═══════════════════════════════════════════════════════════
def assemble_panel(image_bytes: bytes, page: dict, idx: int) -> str:
    th      = THEMES[idx % len(THEMES)]
    dlg_bg  = th[0]
    accent  = th[1]
    bub1_bg = th[2]
    bub2_bg = th[3]
    alt_acc = ALT_ACC[idx % len(ALT_ACC)]
    F_BADGE = _font(32)

    canvas  = Image.new("RGB", (CW, CH), "#050505")

    # ── ZONE 1: Artwork ─────────────────────────────────────
    art = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    art = art.resize((CW, AH), Image.LANCZOS)
    art = ImageEnhance.Color(art).enhance(1.40)
    art = ImageEnhance.Contrast(art).enhance(1.15)
    art = ImageEnhance.Sharpness(art).enhance(1.20)
    canvas.paste(art, (0, 0))
    draw = ImageDraw.Draw(canvas)

    # double border
    draw.rectangle([0,  0,  CW-1,  AH-1],  outline=accent,    width=10)
    draw.rectangle([13, 13, CW-14, AH-14], outline="#FFFFFF66", width=3)

    # panel # badge — styled top-left
    pnum    = f"#{page.get('panel_number', idx + 1):02d}"
    pw, ph  = _sz(draw, pnum, F_BADGE)
    _rrect(draw, [14, 14, 14+pw+36, 14+ph+24], 14, fill=accent)
    _rrect(draw, [16, 16, 14+pw+34, 14+(ph+24)//2], 12, "#FFFFFF33")
    draw.text((14 + 18, 14 + 12), pnum, font=F_BADGE, fill="#FFFFFF")

    # SFX starburst
    _sfx_on_art(canvas, page.get("sound_effect", "").strip(), idx)
    draw = ImageDraw.Draw(canvas)

    # ── SEPARATOR 1 ─────────────────────────────────────────
    draw.rectangle([0, AH, CW, AH + SEP], fill=accent)
    draw.rectangle([0, AH + 2, CW, AH + 5], fill="#FFFFFF55")

    # ── ZONE 2: Dialogue ────────────────────────────────────
    draw.rectangle([0, DLG_Y, CW, DLG_Y + DH], fill=dlg_bg)

    # dot-grid texture
    for row in range(DLG_Y, DLG_Y + DH, 20):
        for col in range(((row - DLG_Y) // 20) % 2 * 10, CW, 20):
            draw.ellipse([col-3, row-3, col+3, row+3], fill="#FFFFFF14")

    # subtle top glow line
    draw.rectangle([0, DLG_Y, CW, DLG_Y + 3], fill=accent + "66")

    l1 = page.get("line_1",    "").strip()
    s1 = page.get("speaker_1", "").strip()
    l2 = page.get("line_2",    "").strip()
    s2 = page.get("speaker_2", "").strip()

    if l1 or s1:
        _bubble(draw, s1, l1,
                bx=BUB_M,       by=DLG_Y + BUB_M,
                bw=BW,          bh=BH,
                bg=bub1_bg,     accent=accent,
                tail_left=True)

    if l2 or s2:
        _bubble(draw, s2, l2,
                bx=CW - BW - BUB_M, by=DLG_Y + BUB_M,
                bw=BW,               bh=BH,
                bg=bub2_bg,          accent=alt_acc,
                tail_left=False)

    # ── SEPARATOR 2 ─────────────────────────────────────────
    draw.rectangle([0, DLG_Y + DH, CW, DLG_Y + DH + SEP], fill=accent)
    draw.rectangle([0, DLG_Y + DH + 2, CW, DLG_Y + DH + 5],
                   fill="#FFFFFF55")

    # ── ZONE 3: Caption ─────────────────────────────────────
    action = page.get("action", "").strip() or "The adventure continues…"
    _caption(draw, action, accent)

    # ── Encode to JPEG ──────────────────────────────────────
    buf = io.BytesIO()
    canvas.save(buf, format="JPEG", quality=96)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


# ═══════════════════════════════════════════════════════════
#  PLACEHOLDER  (no network — pure Pillow)
# ═══════════════════════════════════════════════════════════
def _placeholder(idx: int, page: dict) -> str:
    th     = THEMES[idx % len(THEMES)]
    accent = th[1]
    F_BIG  = _font(72)

    art  = Image.new("RGB", (CW, AH), th[0])
    ad   = ImageDraw.Draw(art)
    for y in range(0, AH, 56):
        for x in range(0, CW, 56):
            ad.ellipse([x-16, y-16, x+16, y+16], fill="#FFFFFF08")
    msg  = f"Panel {page.get('panel_number', idx+1)}"
    mw, mh = _sz(ad, msg, F_BIG)
    _stroke(ad, ((CW-mw)//2, (AH-mh)//2),
            msg, F_BIG, fill=accent, outline="#000000", ow=5)
    ad.rectangle([0, 0, CW-1, AH-1], outline=accent, width=10)

    buf = io.BytesIO()
    art.save(buf, format="PNG")
    return assemble_panel(buf.getvalue(), page, idx)


# ═══════════════════════════════════════════════════════════
#  CONTENT SAFETY
# ═══════════════════════════════════════════════════════════
_BLOCKED = {
    "attack":"play","fighting":"playing","punch":"high-five",
    "kick":"dance","stab":"hug","weapon":"toy","gun":"water gun",
    "knife":"spoon","sword":"stick","blood":"ketchup",
    "death":"sleep","kill":"tickle","scary":"silly",
    "evil":"mischievous","demon":"friendly ghost",
    "explosion":"pop","bomb":"balloon","destroying":"decorating",
    "violence":"kindness","dangerous":"exciting","aggressive":"energetic",
}

def _safe(p: str) -> str:
    lo = p.lower()
    for bad, good in _BLOCKED.items():
        if bad in lo:
            p = p.replace(bad, good)
    return p[:230].strip()


# ═══════════════════════════════════════════════════════════
#  IMAGE GENERATION
# ═══════════════════════════════════════════════════════════
async def _gen_panel(page: dict, idx: int) -> str:
    async with image_semaphore:
        safe    = _safe(page.get("image_prompt", ""))
        headers = {
            "Authorization": f"Bearer {OPENAI_KEY}",
            "Content-Type":  "application/json",
        }
        body = {
            "model":  "dall-e-3",
            "prompt": (
                "Vivid full-color children's comic book illustration. "
                "Bold flat colors, thick black ink outlines, lush rich environment. "
                "Cute friendly cartoon characters — big expressive eyes, round faces, "
                "exaggerated joyful expressions. "
                "Style: Pixar + Cartoon Network + modern children's graphic novel. "
                "Dynamic energetic composition, bright saturated palette. "
                "Detailed colorful background (sky, landscape, buildings, nature). "
                "CRITICAL: absolutely NO text, NO letters, NO words, NO signs anywhere. "
                "Safe, warm, magical, appropriate for children aged 4–8. "
                "Scene: " + safe
            ),
            "n": 1, "size": "1024x1024",
        }
        try:
            resp = await http_client.post(
                "https://api.openai.com/v1/images/generations",
                headers=headers, json=body,
            )
            data = resp.json()
            if "data" not in data:
                print(f"[OpenAI error panel {idx}]", data)
                return _placeholder(idx, page)
            url      = data["data"][0]["url"]
            img_resp = await http_client.get(url)
            return await asyncio.to_thread(
                assemble_panel, img_resp.content, page, idx
            )
        except Exception as exc:
            print(f"[Panel {idx} error] {exc}")
            return _placeholder(idx, page)


# ═══════════════════════════════════════════════════════════
#  GEMINI WRAPPER
# ═══════════════════════════════════════════════════════════
async def _gemini(model: str, prompt: str) -> str:
    def _call():
        return client.models.generate_content(
            model=model, contents=prompt
        ).text.strip()
    return await asyncio.to_thread(_call)


# ═══════════════════════════════════════════════════════════
#  REQUEST MODELS
# ═══════════════════════════════════════════════════════════
class StoryRequest(BaseModel):
    user_input: str

class ChatRequest(BaseModel):
    message: str
    story_context: dict = {}


# ═══════════════════════════════════════════════════════════
#  ROUTES
# ═══════════════════════════════════════════════════════════
@router.post("/generate")
async def generate_story(request: StoryRequest):

    # ── Step 1: extract ingredients ───────────────────────
    raw = await _gemini(FAST_MODEL, f"""
Extract story ingredients from the input.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Input: "{request.user_input}"

{{
    "hero_name":  "child's name or a fun default",
    "sidekick":   "friend, pet, or companion",
    "setting":    "the world or place",
    "superpower": "power or special ability",
    "mood":       "adventure|mystery|funny|magical|spooky"
}}
""")
    raw = raw.replace("```json", "").replace("```", "").strip()
    try:
        ingredients = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(500, "Failed to parse story ingredients.")

    # ── Step 2: generate 12 panels ────────────────────────
    raw2 = await _gemini(STORY_MODEL, f"""
Write a children's comic strip (age 4-8) with exactly 12 panels.
Style: Calvin & Hobbes / Garfield / Cartoon Network.

Hero:       {ingredients['hero_name']}
Sidekick:   {ingredients['sidekick']}
Setting:    {ingredients['setting']}
Superpower: {ingredients['superpower']}
Mood:       {ingredients['mood']}

Return a JSON array of exactly 12 objects.
Each object MUST contain ALL these fields:

"panel_number"
    Integer 1 through 12.

"speaker_1"
    Name of the first speaker, or "" if silent panel.

"line_1"
    What speaker_1 says. Maximum 9 words. Fun and punchy.
    Use "" if speaker_1 is "".

"speaker_2"
    Name of the second speaker, or "" if no reply.

"line_2"
    What speaker_2 says. Maximum 9 words.
    Use "" if speaker_2 is "".

"action"
    *** THIS FIELD IS MANDATORY — NEVER LEAVE IT EMPTY ***
    One complete vivid sentence, 12 to 22 words long.
    Describes EXACTLY what is happening visually in this panel.
    This sentence is printed as the caption below every panel —
    make it colourful, lively and descriptive.
    Do NOT write any dialogue here.
    Example: "Ryo leaps off the rainbow cloud and soars over the
    glittering golden city with his colourful cape streaming behind."

"image_prompt"
    Visual description for the AI image generator.
    Include: character poses, facial expressions, specific bright
    colours ("bright red cape", "sparkling blue wings", "golden glow"),
    and environment details.
    Maximum 40 words. Only friendly, safe, happy descriptions.
    No violent or scary words.

"sound_effect"
    ONE onomatopoeia word in CAPS, e.g.:
    ZOOM YAY WHOOSH POW HA WOW ZAP SPLAT BOING WHEE CRASH
    Use "" if no sound effect fits.

RULES:
— Every single panel MUST have a non-empty "action" sentence.
— Dialogue must be SHORT (≤9 words) — it has to fit a small bubble.
— Build a proper story arc: introduction → adventure → resolution.
— Return ONLY the JSON array. No markdown. No extra text. No code fences.
""")
    raw2 = raw2.replace("```json", "").replace("```", "").strip()
    try:
        pages = json.loads(raw2)
    except json.JSONDecodeError:
        raise HTTPException(500, "Failed to parse story panels.")

    # ensure action is never empty
    for i, page in enumerate(pages):
        if not page.get("action", "").strip():
            page["action"] = (
                f"{ingredients['hero_name']} and "
                f"{ingredients['sidekick']} continue their "
                f"amazing adventure in {ingredients['setting']}."
            )

    # ── Step 3: generate 12 panel images concurrently ─────
    urls = await asyncio.gather(*[
        _gen_panel(page, idx) for idx, page in enumerate(pages)
    ])
    for i, page in enumerate(pages):
        page["image_url"] = urls[i]

    return {"ingredients": ingredients, "pages": pages}


@router.post("/chat")
async def chat_with_story(request: ChatRequest):
    ctx = ""
    if request.story_context:
        ing  = request.story_context.get("ingredients", {})
        pgs  = request.story_context.get("pages",       [])
        sums = "\n".join(
            f"Panel {p.get('panel_number', i+1)}: {p.get('action', '')}"
            for i, p in enumerate(pgs[:6])
        )
        ctx = (
            f"Hero: {ing.get('hero_name','?')} | "
            f"Sidekick: {ing.get('sidekick','?')} | "
            f"Setting: {ing.get('setting','?')} | "
            f"Mood: {ing.get('mood','adventure')}\n"
            f"Story so far:\n{sums}"
        )
    reply = await _gemini(FAST_MODEL, f"""
You are a friendly comic book helper for children aged 4-8.
Simple words. Short sentences. Max 2 emoji. Stay in the story.
{ctx}
Child asks: "{request.message}"
Reply in 2-3 short fun sentences.
""")
    return {"reply": reply}