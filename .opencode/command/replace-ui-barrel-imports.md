---
description: Remplacer les imports `@oppsys/ui` par des sous-paths précis
---

# Task: Remplacer les imports barrel `@oppsys/ui` par des imports ciblés

Objectif : dans `apps/client/src` remplacer tous les imports qui viennent du barrel `@oppsys/ui` par des imports sur les chemins précis (par exemple `@oppsys/ui/components/typography` ou `@oppsys/ui/lib/sonner`) afin de réduire la taille du bundle.

Principe :

- Scanner `packages/ui/src` pour construire une table de correspondance symbol -> fichier (ex: `H1` -> `@oppsys/ui/components/typography`).
- Parcourir les fichiers sous `apps/client/src` et remplacer les imports `from "@oppsys/ui"` par un ou plusieurs imports pointant vers les fichiers ciblés.
  .
