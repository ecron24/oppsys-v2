# AGENTS.md

## Build, Lint, and Test Commands

- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Typecheck**: `pnpm check-types`
- **Format**: `pnpm format`

## Code Style Guidelines

### General

- This is a pnpm monorepo with two main apps: `api` and `web`.
- Each app has its own linting configuration.
- Prefer `type` over `interface` in TypeScript unless it's really an interface to be implemented by classes.
- Don't add any comments unless absolutely necessary. Code should be self-explanatory.

### Imports

- Use ES module imports (`import ... from '...'`).
- Use (`import type ... from '...'`) when importing type/inferce

### Exports

- Always use named exports for functions and variables unless we have no other choice.

### Formatting

- Formatting is enforced by ESLint. Run `pnpm lint --fix` to automatically fix formatting issues.

### Types

- The project uses TypeScript. Make sure to add types to all new code.
- Run `pnpm check-types` to check for type errors.

### Naming Conventions

- Use camelCase for variables and functions.
- Use PascalCase for classes and components.

## Folder structure

### Structure du projet

```bash
pnpm-workspace.yaml
turbo.json
apps/
  api/        # Backend API (routes, logique métier, intégration Supabase)
  client/     # Frontend client (React, Vite)
packages/
  logger/     # Utilitaires de logging
  n8n/        # Intégration et types pour n8n
  supabase/   # Fonctions et types pour Supabase
  ui/         # Librairie de composants UI
  types/      # Shared types
```

### Folder for backend (api)

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

### Folder for frontend (client)

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

## Architecture detail

- Frontend: Please refer to @.ai/frontend-architecture.md for detailed frontend architecture guidelines.
- Backend: Please refer to @.ai/backend-architecture.m` for detailed backend architecture guidelines.

Use your Read tool to load it on a need-to-know basis
