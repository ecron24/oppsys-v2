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
