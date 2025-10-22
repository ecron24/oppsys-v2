---
description: Transform JSX code TypeScript
---

# Task: Transform JSX code TypeScript

You are an expert in software architecture. Transform the provided javascript code into a typescript.

- Separate components, application services, and hooks.
- Don't use type `any`
- When calling `apiService.*` or `supabase.*` use the `honoClient` at @apps/client/src/lib/hono-client.ts and create separetad service instead of direct call
- When calling `supabase.*`, first check if it exist in `honoClient` at @apps/client/src/lib/hono-client.ts and create separetad service instead of direct call. If not exist, create always a separated service and use @apps/client/src/lib/supabase.ts
- Check if service is already is existed before creating

## Here is the raw code

$ARGUMENTS

## Here is the frontend reference

@.ai/frontend-architecture.md
