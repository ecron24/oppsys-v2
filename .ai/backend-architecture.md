# Backend Architecture

This document outlines the architecture and design principles of the backend of our application. The backend is built using `Supabase`, `Node.js`, `Hono`, and `TypeScript` as main technologies.

> The application is stored on the folder `apps/api`.
> The application use path alias `src/*` to refer `src/*` folder.
> All path mentioned here are relative to `apps/api` folder.
> Omit try catch inside use case implementation.

## How to handle errors

We use the principles of _error as value_. We use only `try/catch` on the low level of the component that there is no other way to handle the error.

If the function return is successful, the return format is:

```ts
{
  success: true;
  data: T;
} as const
```

If the function return is an error, the return format is:

```ts
{
  success: false;
  kind: "ANY_ERROR_KIND"; // string literal to identify the error kind
  error: Error; // instance of Error
} as const
```

There is custom type to built them by :

```ts
import type { Result } from "@oppsys/types";
// example
type GetModulesResult = Result<Module[], Error, "UNKNOWN_ERROR">;
```

## Architecture

The backend follows a hexagonal architecture pattern, which separates the core business logic from the infrastructure and external services. This allows for better maintainability, testability, and scalability.

The main components of the architecture are:

- **domain**: This layer contains all entities and contracts of the application. Stored on the folder `src/[features]/domain`.
- **app**: This layer contains the use cases and business logic of the application. It interacts with the domain layer and orchestrates the flow of data. Stored on the folder `src/[features]/application`.
- **infra**: This layer contains the implementation of external services and frameworks. It interacts with the application layer through interfaces defined in the domain layer. Stored on the folder `src/[features]/infrastructure`.
- **presentation**: This layer contains the API endpoints and request/response handling. It uses the **Hono** to define routes and middleware. Stored on the folder `src/[features]/presentation`.
- **entrypoint**: This is the file `src/index.ts`.

We are going to use the feature example to serve as a guide for the architecture. This example follows our folder structure, it like a real world example.

> **Feature: User Registration**
> User can register an account using email and password. User receives a verification email upon registration.

### Domain Layer

The domain layer contains the core entities and contracts related to user registration.

```ts
// src/user/domain/user.ts
import z from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  password: z.string(),
});
export type User = z.infer<typeof UserSchema>;
```

```ts
// src/user/domain/user/user-repo.ts
export type CreateUserResult = Result<
  void,
  Error,
  "UNKNOWN_ERROR" | "EMAIL_ALREADY_IN_USE"
>;

export type GetUserByEmailResult = Result<User | null, Error, "UNKNOWN_ERROR">;

export interface UserRepo {
  createUser(user: User): Promise<CreateUserResult>;
  getUserByEmail(email: string): Promise<GetUserByEmailResult>;
}
```

```ts
// src/email/domain/mailer-repo.ts
export type SendVerificationEmailResult = Result<
  void,
  Error,
  "EMAIL_SEND_FAILED" | "UNKNOWN_ERROR"
>;

export interface MailerRepo {
  sendVerificationEmail(
    email: string,
    verificationLink: string
  ): Promise<SendVerificationEmailResult>;
}
```

### Application Layer

The application layer contains the use case for getting module.

```ts
// src/modules/application/get-modules-usecase.ts
import { buildUseCase } from "src/lib/use-case-builder";
import { ListModulesQuerySchema } from "../domain/module";

export const getModulesUseCase = buildUseCase()
  .input(ListModulesQuerySchema)
  .handle(async (ctx, query) => {
    const modules = await ctx.moduleRepo.getAll(query);

    return modules;
  });
```

### Infrastructure Layer

The infrastructure layer contains the implementation of the `UserRepoPort` interfaces.

```ts
// src/user/infrastructure/user-repo-supabase.ts
import {
  UserRepoPort,
  CreateUserResult,
  GetUserByEmailResult,
} from "src/user/domain/user-repo";

export class UserRepoSupabase implements UserRepo {
  // Implementation goes here
}
```

### Presentation Layer

The presentation layer contains the API endpoint for user registration. We are going to use **Hono** to define the route and middleware.

```ts
// src/user/presentation/module-router.ts
import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { ListModulesQuerySchema } from "../domain/module";
import { getModulesUseCase } from "../app/get-modules-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";

export const moduleRouter = honoRouter((ctx) => {
  const router = new Hono().get(
    "/",
    zValidatorWrapper("query", ListModulesQuerySchema),
    async (c) => {
      const result = await getModulesUseCase(ctx, c.req.valid("query"));
      return handleResultResponse(c, result);
    }
  );

  return router;
});
```

```ts
// src/api-router.ts
// Some code...
import { Hono } from "hono";
import { honoRouter } from "./lib/hono-router";
import { moduleRouter } from "./modules/presentation/module-router";

export const apiRouter = honoRouter(() => {
  const router = new Hono().route("/api/modules", moduleRouter);

  return router;
});
export type ApiRouter = typeof apiRouter;
```

We throw a generic error to the client, and log the actual error on the server. This is to avoid leaking sensitive information to the client.

## Technologies

- "@supabase/supabase-js": "^2.58.0",
- firebase-functions: "^6.0.1",
- zod: ^4.1.11
- "hono": "^4.9.9"
