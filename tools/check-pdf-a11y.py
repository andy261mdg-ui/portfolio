#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Contrôle d'accessibilité du CV PDF (balisage, langue, titre).

Usage : python tools/check-pdf-a11y.py assets/cv/CV-Andy-Rakotondrabe.pdf

Appelé à la fin de `npm run cv` et par la CI : sans ce contrôle, une
régression silencieuse (PDF de nouveau non balisé) passerait inaperçue.
Sortie : code 0 si tout est conforme, 1 sinon.
Dépendance : pypdf (pip install pypdf)
"""
import sys

from pypdf import PdfReader
from pypdf.generic import DictionaryObject, IndirectObject

# Titres de sections attendus, dans l'ordre de lecture du CV.
SECTIONS = ["Profil", "Expérience", "Formation", "Compétences"]

# Quelques faits de la source de vérité éditoriale (cf. README) : le PDF doit
# les contenir, sinon c'est que la page cv.html a régressé.
FAITS = ["IGN France", "Android MT", "NuMedia", "Le Mag Auto Prestige", "PhonAndroid"]


def resoudre(objet):
    """Suit les références indirectes jusqu'à l'objet réel."""
    while isinstance(objet, IndirectObject):
        objet = objet.get_object()
    return objet


def parcourir(noeud, profondeur, sortie):
    """Parcourt l'arbre de structure et renvoie les couples (profondeur, balise)."""
    noeud = resoudre(noeud)
    if not isinstance(noeud, DictionaryObject):
        return
    balise = noeud.get("/S")
    if balise is not None:
        sortie.append((profondeur, str(balise)))
        profondeur += 1
    enfants = resoudre(noeud.get("/K"))
    if enfants is None:
        return
    if isinstance(enfants, list):
        for enfant in enfants:
            parcourir(enfant, profondeur, sortie)
    else:
        parcourir(enfants, profondeur, sortie)


def verifier(chemin):
    lecteur = PdfReader(chemin)
    erreurs = []

    if len(lecteur.pages) != 1:
        erreurs.append(f"le CV doit tenir sur une page, {len(lecteur.pages)} trouvée(s)")

    racine = lecteur.trailer["/Root"]

    # 1. Langue déclarée
    langue = racine.get("/Lang")
    if str(langue or "") != "fr-FR":
        erreurs.append(f"langue du document absente ou incorrecte : {langue!r} (attendu fr-FR)")

    # 2. Titre et affichage du titre dans la barre du lecteur
    titre = lecteur.metadata.get("/Title") if lecteur.metadata else None
    if not titre:
        erreurs.append("titre du document absent")
    preferences = racine.get("/ViewerPreferences") or {}
    preferences = resoudre(preferences)
    if not isinstance(preferences, DictionaryObject) or not preferences.get("/DisplayDocTitle"):
        erreurs.append("ViewerPreferences /DisplayDocTitle absent (le lecteur afficherait le nom de fichier)")

    # 3. Document balisé
    marquage = resoudre(racine.get("/MarkInfo")) or {}
    if not isinstance(marquage, DictionaryObject) or not marquage.get("/Marked"):
        erreurs.append("MarkInfo /Marked absent : le PDF n'est pas balisé")
    if not racine.get("/StructTreeRoot"):
        erreurs.append("StructTreeRoot absent : aucun ordre de lecture pour les lecteurs d'écran")
        return erreurs

    # 4. Balises attendues, dans l'ordre
    balises = []
    parcourir(racine["/StructTreeRoot"], 0, balises)
    noms = [nom for _, nom in balises]
    if not noms or noms[0] != "/Document":
        erreurs.append(f"première balise attendue /Document, trouvée {noms[0] if noms else 'aucune'}")
    for nom in ("/H1", "/H2", "/P", "/L", "/LI", "/Lbl"):
        if nom not in noms:
            erreurs.append(f"balise {nom} absente de l'arbre de structure")
    if noms.count("/H1") != 1:
        erreurs.append(f"un seul titre H1 attendu, {noms.count('/H1')} trouvé(s)")

    # 5. Titres de sections présents et dans l'ordre de lecture
    texte = lecteur.pages[0].extract_text() or ""
    positions = []
    for section in SECTIONS:
        position = texte.find(section.upper())
        if position < 0:
            erreurs.append(f"section « {section} » absente du texte du PDF")
        else:
            positions.append(position)
    if positions != sorted(positions):
        erreurs.append("les sections ne se suivent pas dans l'ordre attendu")

    # 6. Faits éditoriaux et typographie
    for fait in FAITS:
        if fait not in texte:
            erreurs.append(f"référence « {fait} » absente du PDF")
    if "\u2014" in texte:
        erreurs.append("tiret cadratin (—) présent : interdit dans les contenus du site")

    return erreurs


def main(chemin):
    try:
        erreurs = verifier(chemin)
    except Exception as erreur:  # PDF illisible, structure inattendue…
        print(f"ECHEC  {chemin} : {erreur}")
        return 1

    if erreurs:
        print(f"ECHEC  {chemin} : accessibilité du PDF")
        for erreur in erreurs:
            print(f"  - {erreur}")
        return 1

    print(f"OK     {chemin} : PDF balisé (structure, langue, titre affiché), une page")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage : python tools/check-pdf-a11y.py <cv.pdf>")
    sys.exit(main(sys.argv[1]))
