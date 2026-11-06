# -*- coding: utf-8 -*-
"""Génère les images dérivées du portfolio.

À partir de l'original haute définition conservé dans `sources/`, ce script produit :

  assets/img/andy-rakotondrabe-portrait-300.webp / .jpg   portrait 300 px
  assets/img/andy-rakotondrabe-portrait-600.webp / .jpg   portrait 600 px (écrans HiDPI)
  assets/img/andy-rakotondrabe-og-cover.jpg              carte de partage 1200×630

Les icônes du monogramme (favicons + apple-touch-icon) ne sont PAS générées ici
mais par `npm run logo` : voir tools/generate-logo.mjs.

Dépendance : Pillow (`pip install pillow`).
Utilisation : `python tools/generate-images.py`
"""

import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
SRC = os.path.join(ROOT, "sources", "andy-rakotondrabe-portrait-cadre.png")

# Polices Windows ; repli DejaVuSans si indisponibles.
BOLD_CANDIDATES = [
    r"C:\Windows\Fonts\segoeuib.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
REGULAR_CANDIDATES = [
    r"C:\Windows\Fonts\segoeui.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]

NAVY = (15, 23, 42)
BLUE = (37, 99, 235)
LIGHT_BLUE = (96, 165, 250)
GREY = (203, 213, 225)
GREY_DARK = (148, 163, 184)
WHITE = (255, 255, 255)


def load_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def spaced(draw, xy, text, font, fill, tracking=0):
    """Dessine un texte avec un interlettrage (tracking en pixels)."""
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=font, fill=fill)
        x += draw.textlength(char, font=font) + tracking


def main():
    if not os.path.exists(SRC):
        raise SystemExit(
            "Original introuvable : %s\n"
            "Placez le portrait haute définition dans sources/." % SRC
        )

    src = Image.open(SRC).convert("RGBA")

    # ---------- 1. Portrait : 300 px et 600 px (WebP + JPEG de repli) ----------
    for size in (300, 600):
        resized = src.resize((size, size), Image.LANCZOS)
        resized.save(
            os.path.join(IMG, "andy-rakotondrabe-portrait-%d.webp" % size),
            "WEBP", quality=82, method=6,
        )
        flat = Image.new("RGB", (size, size), WHITE)
        flat.paste(resized, (0, 0), resized)
        flat.save(
            os.path.join(IMG, "andy-rakotondrabe-portrait-%d.jpg" % size),
            "JPEG", quality=86, optimize=True, progressive=True,
        )

    # ---------- 2. Carte Open Graph 1200 × 630 ----------
    width, height = 1200, 630
    card = Image.new("RGB", (width, height), NAVY)

    # Halo bleu discret en haut à droite
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for i in range(60, 0, -1):
        radius = 40 * i
        alpha = int(3 * (60 - i) / 60 + 2)
        gdraw.ellipse(
            [980 - radius, 60 - radius, 980 + radius, 60 + radius],
            fill=(37, 99, 235, alpha),
        )
    card = Image.alpha_composite(card.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(card)

    draw.rectangle([0, 0, 12, height], fill=BLUE)

    # Portrait circulaire (masque suréchantillonné pour des bords lisses)
    size = 420
    ss = 4
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size * ss - 1, size * ss - 1], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)

    portrait = src.resize((size, size), Image.LANCZOS)
    portrait.putalpha(mask)

    cx, cy = 940, height // 2
    draw.ellipse(
        [
            cx - size // 2 - 12, cy - size // 2 - 12,
            cx + size // 2 + 12, cy + size // 2 + 12,
        ],
        outline=BLUE, width=7,
    )
    card.paste(portrait, (cx - size // 2, cy - size // 2), portrait)
    draw = ImageDraw.Draw(card)

    x = 84
    spaced(draw, (x, 132), "RÉDACTEUR WEB FREELANCE",
           load_font(BOLD_CANDIDATES, 26), LIGHT_BLUE, tracking=4)
    draw.text((x, 178), "Andy", font=load_font(BOLD_CANDIDATES, 82), fill=WHITE)
    draw.text((x, 266), "Rakotondrabe", font=load_font(BOLD_CANDIDATES, 82), fill=WHITE)
    draw.text((x, 378), "SEO Content Writer  -  Guest Blogger",
              font=load_font(REGULAR_CANDIDATES, 38), fill=GREY)
    draw.line([x, 452, 640, 452], fill=(51, 65, 85), width=2)
    draw.text((x, 480), "Articles  -  Tutoriels  -  Dossiers",
              font=load_font(REGULAR_CANDIDATES, 28), fill=GREY_DARK)
    draw.text((x, 518), "Guides d'achat  -  Contenus SEO",
              font=load_font(REGULAR_CANDIDATES, 28), fill=GREY_DARK)
    draw.text((x, 566), "andy261mdg-ui.github.io/portfolio",
              font=load_font(REGULAR_CANDIDATES, 24), fill=LIGHT_BLUE)

    card.save(
        os.path.join(IMG, "andy-rakotondrabe-og-cover.jpg"),
        "JPEG", quality=88, optimize=True, progressive=True,
    )

    print("Images générées :")
    for folder, name in (
        (IMG, "andy-rakotondrabe-portrait-300.webp"),
        (IMG, "andy-rakotondrabe-portrait-600.webp"),
        (IMG, "andy-rakotondrabe-portrait-300.jpg"),
        (IMG, "andy-rakotondrabe-portrait-600.jpg"),
        (IMG, "andy-rakotondrabe-og-cover.jpg"),
    ):
        path = os.path.join(folder, name)
        print("  %-44s %7.1f Ko" % (name, os.path.getsize(path) / 1024))


if __name__ == "__main__":
    main()
