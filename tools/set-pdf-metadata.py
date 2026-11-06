# -*- coding: utf-8 -*-
"""Complète les métadonnées du CV PDF (Chrome/Skia n'exporte pas les <meta> HTML).

Usage : python tools/set-pdf-metadata.py <cv.pdf>
Appele par tools/generate-cv.mjs après la génération (npm run cv).
Dépendance : pypdf (pip install pypdf)
"""
import os
import sys

from pypdf import PdfWriter
from pypdf.generic import NameObject, TextStringObject

METADONNEES = {
    "/Title": "CV d'Andy Rakotondrabe · Rédacteur web freelance SEO",
    "/Author": "Andy Rakotondrabe",
    "/Subject": (
        "CV de rédacteur web freelance SEO (NTIC et high-tech) : "
        "guest blogger IGN France et Android MT, pigiste NuMedia"
    ),
    "/Keywords": (
        "CV, rédacteur web freelance, rédaction SEO, contenu web, "
        "pigiste, high-tech, NTIC, WordPress, Andy Rakotondrabe"
    ),
}


def main(chemin):
    ecrivain = PdfWriter(clone_from=chemin)
    ecrivain.add_metadata(METADONNEES)
    # Langue du document (catalogue, pas l'info dict) : détection de langue des
    # moteurs et prise en charge par les lecteurs d'écran.
    ecrivain.root_object[NameObject("/Lang")] = TextStringObject("fr-FR")
    temporaire = chemin + ".tmp"
    with open(temporaire, "wb") as fichier:
        ecrivain.write(fichier)
    os.replace(temporaire, chemin)
    print("Métadonnées PDF écrites :", chemin)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage : python tools/set-pdf-metadata.py <cv.pdf>")
    main(sys.argv[1])