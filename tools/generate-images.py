# -*- coding: utf-8 -*-
"""Génère les images dérivées du portfolio.

À partir de l'original haute définition conservé dans `sources/`, ce script produit :

  assets/img/andy-rakotondrabe-portrait-300.webp / .jpg   portrait 300 px
  assets/img/andy-rakotondrabe-portrait-600.webp / .jpg   portrait 600 px (écrans HiDPI)
  assets/img/andy-rakotondrabe-og-cover.jpg              carte de partage 1200×630
  assets/img/logo-icon.png                               pictogramme du logo (en-tête)
  assets/favicon-16.png / assets/favicon-32.png          favicons (tuile blanche)
  assets/apple-touch-icon.png                            icône Apple 180×180 (logo complet)

Les trois derniers dérivent de sources/logo-andy-rakotondrabe.png : le
pictogramme est découpé automatiquement (premier bloc non blanc, avant le
wordmark) et son fond extérieur devient transparent.

Dépendance : Pillow (`pip install pillow`).
Utilisation : `python tools/generate-images.py` (aussi `npm run logo`)
"""

import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
SRC = os.path.join(ROOT, "sources", "andy-rakotondrabe-portrait-cadre.png")
LOGO_SRC = os.path.join(ROOT, "sources", "logo-andy-rakotondrabe.png")

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


def decoupe_pictogramme(im):
    """Isole le pictogramme (livre + curseur + pixels) : premier bloc de
    contenu non blanc, arrêté à la bande blanche d'au moins 40 px qui le
    sépare du wordmark. Retourne le crop RGB."""
    masque = im.convert("L").point(lambda v: 255 if v < 245 else 0)
    w, h = masque.size
    fin = None
    vide = 0
    for y in range(h):
        if masque.crop((0, y, w, y + 1)).getbbox():
            fin = y
            vide = 0
        elif fin is not None:
            vide += 1
            if vide >= 40:
                break
    if fin is None:
        raise SystemExit("Logo : aucun contenu détecté (image toute blanche ?)")
    box = masque.crop((0, 0, w, fin + 1)).getbbox()
    return im.crop(box)


def fond_transparent(im):
    """Fond blanc extérieur → transparence (flood depuis les angles blancs).
    Les blancs internes du dessin peuvent être avalés : sans effet visuel,
    le site étant sur fond blanc et les tuiles de favicons étant blanches."""
    rgb = im.convert("RGB")
    tmp = rgb.copy()
    w, h = tmp.size
    for coin in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        r, g, b = tmp.getpixel(coin)
        if min(r, g, b) >= 245:
            ImageDraw.floodfill(tmp, coin, (255, 0, 255), thresh=45)
    src = rgb.load()
    marque = tmp.load()
    out = Image.new("RGBA", im.size)
    pix = out.load()
    for y in range(h):
        for x in range(w):
            if marque[x, y] == (255, 0, 255):
                pix[x, y] = (0, 0, 0, 0)
            else:
                r, g, b = src[x, y]
                pix[x, y] = (r, g, b, 255)
    return out


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
    draw.text((x, 566), "andy.rakotondrabe.net",
              font=load_font(REGULAR_CANDIDATES, 24), fill=LIGHT_BLUE)

    card.save(
        os.path.join(IMG, "andy-rakotondrabe-og-cover.jpg"),
        "JPEG", quality=88, optimize=True, progressive=True,
    )

    # ---------- 3. Logo : pictogramme, favicons, icône Apple ----------
    if not os.path.exists(LOGO_SRC):
        raise SystemExit(
            "Logo introuvable : %s\n"
            "Placez le logo original dans sources/." % LOGO_SRC
        )
    logo_src = Image.open(LOGO_SRC).convert("RGB")
    pict = fond_transparent(decoupe_pictogramme(logo_src))

    # Pictogramme de l'en-tête : hauteur 152 px (4 × l'affichage 38 px),
    # fond transparent, ratio d'origine préservé.
    m_h = 152
    m_w = max(1, round(pict.width * m_h / pict.height))
    pict.resize((m_w, m_h), Image.LANCZOS).save(
        os.path.join(IMG, "logo-icon.png"), "PNG", optimize=True
    )

    # Favicons : tuile blanche opaque (le pictogramme, sombre par endroits,
    # reste lisible sur les onglets en thème sombre), pictogramme à pleine
    # largeur et centré verticalement.
    for size in (16, 32):
        tuile = Image.new("RGB", (size, size), WHITE)
        f_w = size
        f_h = max(1, round(pict.height * f_w / pict.width))
        mini = pict.resize((f_w, f_h), Image.LANCZOS)
        tuile.paste(mini, ((size - f_w) // 2, (size - f_h) // 2), mini)
        tuile.save(
            os.path.join(ROOT, "assets", "favicon-%d.png" % size),
            "PNG", optimize=True,
        )

    # Icône Apple : plein cadre blanc avec le logo complet (iOS applique
    # lui-même son masque d'arrondi), contenu dans une marge de 10 px.
    contenu = logo_src.convert("L").point(lambda v: 255 if v < 245 else 0).getbbox()
    logo_net = logo_src.crop(contenu)
    tuile = Image.new("RGB", (180, 180), WHITE)
    l_w = 160
    l_h = max(1, round(logo_net.height * l_w / logo_net.width))
    agrand = logo_net.resize((l_w, l_h), Image.LANCZOS)
    tuile.paste(agrand, ((180 - l_w) // 2, (180 - l_h) // 2))
    tuile.save(
        os.path.join(ROOT, "assets", "apple-touch-icon.png"), "PNG", optimize=True
    )

    print("Images générées :")
    for folder, name in (
        (IMG, "andy-rakotondrabe-portrait-300.webp"),
        (IMG, "andy-rakotondrabe-portrait-600.webp"),
        (IMG, "andy-rakotondrabe-portrait-300.jpg"),
        (IMG, "andy-rakotondrabe-portrait-600.jpg"),
        (IMG, "andy-rakotondrabe-og-cover.jpg"),
        (IMG, "logo-icon.png"),
        (os.path.join(ROOT, "assets"), "favicon-16.png"),
        (os.path.join(ROOT, "assets"), "favicon-32.png"),
        (os.path.join(ROOT, "assets"), "apple-touch-icon.png"),
    ):
        path = os.path.join(folder, name)
        print("  %-44s %7.1f Ko" % (name, os.path.getsize(path) / 1024))


if __name__ == "__main__":
    main()
