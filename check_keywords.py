#!/usr/bin/env python3
"""
Compare les mots-clés de liste_mots_cles.txt avec ceux référencés dans
manuel-theme.html et manuel-a-z.html.
Signale les mots-clés manquants et ceux en trop pour chaque page.
"""

import re
import sys
from urllib.parse import unquote


def extract_keywords_from_file(filename):
    """Extrait les mots-clés depuis les liens href="./Keywords/XXX.html" d'un fichier HTML."""
    keywords = set()
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = re.compile(r'href="\./Keywords/([^"]+)\.html"')
    matches = pattern.findall(content)
    for m in matches:
        decoded = unquote(m)
        keywords.add(decoded)
    return keywords, len(matches)  # on retourne aussi le nb de liens (incluant doublons)


def load_ref_keywords(filename):
    """Charge les mots-clés depuis le fichier de référence (un par ligne)."""
    keywords = []
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            kw = line.strip()
            if kw:
                keywords.append(kw)
    return keywords


# --- 1. Charger la référence ---
ref_keywords = load_ref_keywords("liste_mots_cles.txt")
ref_set = set(ref_keywords)
print(f"Mots-clés dans liste_mots_cles.txt : {len(ref_keywords)} (uniques: {len(ref_set)})")

# --- 2. Traiter chaque page ---
pages = [
    ("manuel-theme.html", "Manuel par Thèmes"),
    ("manuel-a-z.html", "Manuel A-Z"),
]

for filename, label in pages:
    try:
        html_keywords, nb_links = extract_keywords_from_file(filename)
    except FileNotFoundError:
        print(f"\n⚠️  Fichier introuvable : {filename}")
        continue

    print(f"\n{'=' * 70}")
    print(f"RAPPORT : {label} ({filename})")
    print(f"{'=' * 70}")
    print(f"Liens Keywords trouvés : {nb_links} (mots-clés uniques : {len(html_keywords)})")

    missing = sorted(ref_set - html_keywords)
    extra = sorted(html_keywords - ref_set)

    if missing:
        print(f"\n🔴 MOTS-CLÉS ABSENTS ({len(missing)}) :")
        for kw in missing:
            print(f"   - {kw}")
    else:
        print("\n✅ Tous les mots-clés de référence sont présents.")

    if extra:
        print(f"\n🟡 MOTS-CLÉS EN TROP (absents de la référence) ({len(extra)}) :")
        for kw in extra:
            print(f"   - {kw}")
    else:
        print("\n✅ Aucun mot-clé superflu.")

    print(f"\n➡ Résumé : {len(ref_set)} dans la référence | {len(html_keywords)} dans le HTML")
    print(f"   Manquants : {len(missing)} | En trop : {len(extra)}")

print("\n" + "=" * 70)
print("VÉRIFICATION TERMINÉE")
print("=" * 70)
