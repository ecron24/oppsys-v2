---
description: CamelCase and SnakeCase mapping
---

# Task: Check mapping between CamelCase and SnakeCase

in all file `*-repo-supabase.ts`, when insert or update, data passed must be wrapped with `toSnakeCase(...)`. And for all others (insert, update, select, ...) add data returned must be wrapped with `toCamelCase(...)` or manually mapped also typed with "as" before parsing with "Zod"

Check all and tell me if I missed some of this rules in the files.
