# oppsys-v2

## Structure du projet

```bash
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
README.md
turbo.json
apps/
  api/        # Backend API (routes, logique métier, intégration Supabase)
  client/     # Frontend client (React, Vite)
packages/
  logger/     # Utilitaires de logging
  n8n/        # Intégration et types pour n8n
  supabase/   # Fonctions et types pour Supabase
  ui/         # Librairie de composants UI
```

### Détail des dossiers principaux

- **apps/api/** : Contient l'API backend
- **apps/client/** : Application frontend basée sur React et Vite.
- **packages/logger/** : Module pour la gestion des logs.
- **packages/n8n/** : Types et intégrations pour n8n.
- **packages/supabase/** : Fonctions utilitaires et types pour interagir avec Supabase.
- **packages/ui/** : Librairie de composants UI réutilisables.

## Architecture du backend (api)

```bash
src/ # Code source principal
lib/ # Librairies internes (ex: hono-router, supabase)
modules/ # Tou ce qui concerne module
  app/ # Cas d'utilisation liés à l'application et logique metier
  domain/ # Entités et repositories du domaine
  infra/ # Implémentations des repositories (ex: Supabase)
  presentation/ # Routes et contrôleurs
user/ # Modules métier
  app/ # Cas d'utilisation liés à l'application et logique metier
  domain/ # Entités et repositories du domaine
  infra/ # Implémentations des repositories (ex: Supabase)
[same_for_others_features]/
  app/ # Cas d'utilisation liés à l'application et logique metier
  domain/ # Entités et repositories du domaine
  infra/ # Implémentations des repositories (ex: Supabase)
```

# Architecture du frontend (client)

```bash
src/ # Code source principal du front
app/ # Pages principales (home, search)
  home-page.tsx
  search/
    search-page.tsx
components/ # Composants React globaux (providers, etc.)
lib/ # Librairies et utilitaires (hono-client, supabase)
features/ # Fonctionnalite reutilisatle
  f1/
    components/
    f1.tsx
env.ts # Variables d'environnement
index.css # Styles globaux
main.tsx # Point d'entrée de l'application
public/ # Fichiers statiques (images, icônes)
```
