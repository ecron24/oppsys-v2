---
description: Transform raw code into hexagonal architecture
---

# Task: Transform Code to Hexagonal Architecture

You are an expert in software architecture. Transform the provided raw code into a hexagonal architecture (ports and adapters pattern).

- Separate domain logic, application services, infrastructure, and presentation layers.
- Use clear boundaries and dependency inversion.
- The method in repository doesn't content more logic, split it if it contain more logic and put in the usecase instead
- Always check if aldready existed in current features and in others features before creating, if existed, reuse and you can modify if needed.

## Here is the raw code

$ARGUMENTS

## Here is the architecture reference

@.ai/backend-architecture.md
