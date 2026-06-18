# MEMORY.md — Mémoire du projet

Ce fichier est rempli et mis à jour par les agents au fil du temps. Il conserve la trace des décisions importantes, des préférences de l'utilisateur, et du contexte accumulé au fil des sessions.

---

## Décisions et orientations

<!-- Les agents ajoutent ici les choix importants faits avec l'utilisateur, en datant chaque entrée -->

[À remplir par les agents au fil du temps]

## Préférences utilisateur

<!-- Ce que l'utilisateur aime / n'aime pas, découvert au fil des interactions -->

- Préfère les réponses concises (pas de longs pavés)
- N'aime pas le jargon technique
- Veut des résumés de résultat, pas la liste des étapes techniques

## Travail en cours

<!-- Noter ici ce qui est en chantier, pour qu'un autre agent puisse reprendre -->

[Aucun travail en cours]

## Points de vigilance

<!-- Choses à vérifier, pièges déjà rencontrés, etc. -->

- `manuel-theme.html` est le fichier le plus sujet aux conflits : toujours vérifier l'intégrité des `<div>` après modification
- Le format `<font face="Calibri">` est obligatoire dans les pages `Keywords/` — c'est le format source attendu par les scripts de traitement
- `check_keywords.py` doit toujours passer avant de considérer un build comme valide
- Le `post_build.cjs` copie `download/` dans `dist/` — ne pas supprimer ce dossier même s'il est gitignoré
