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
- **app**: This layer contains the use cases and business logic of the application. It interacts with the domain layer and orchestrates the flow of data. Stored on the folder `src/[features]/app`.
- **infra**: This layer contains the implementation of external services and frameworks. It interacts with the application layer through interfaces defined in the domain layer. Stored on the folder `src/[features]/infra`.
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

#### Database type reference

- It is located at @packages/supabase/database.types.ts
- Always use `camelCase` in the schema
- Common schema is located at @apps/api/src/common/common-schema.ts

### Application Layer

The application layer contains the use case for retrieving user.

```ts
// src/user/application/get-user-usecase.ts
import { buildUseCase } from "src/lib/use-case-builder";
import { ListUserQuerySchema } from "../domain/module";

export const getUserUseCase = buildUseCase()
  .input(ListUserQuerySchema)
  .handle(async (ctx, query) => {
    const modules = await ctx.moduleRepo.getAll(query);

    if (!modules.success) {
      ctx.logger.error("[get] failed", result.error, { query });
      return {
        success: false,
        kind: "INTERNAL_SERVER_ERROR",
        error: new Error("INTERNAL_SERVER_ERROR", 500),
      } as const;
    }
    return { success: true, data: { storeId: result.data } } as const;

    return modules;
  });
```

### Infrastructure Layer

The infrastructure layer contains the implementation of the `UserRepo` interfaces.

```ts
// src/user/infra/user-repo-supabase.ts
import {
  UserRepo,
  CreateUserResult,
  GetUserByEmailResult,
} from "src/user/domain/user-repo";
import type { Logger } from "src/logger/domain/logger";
import type { OppSysSupabaseClient } from "@oppsys/supabase";

export class UserRepoSupabase implements UserRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
    // ... others if needed
  ) {}

  async getAll(query: ListModulesQuery): Promise<GetModulesResult> {
    return await tryCatch(async () => {
      const select = this.supabase.from("users").select(
        `
          id,
          name
        `
      );
      const { data, error } = await select;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: ListUserSchema.parse(data || []),
      } as const;
    });
  }

  // Other implementation goes here, ...
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
      return handleResultResponse(c, result, , { oppSysContext: ctx });
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

```ts
// src/get-context.ts
// Some code...
import { AuthRepoSupabase } from "./auth/infra/auth-repo-supabase";
import { supabase } from "./lib/supabase";
import { LoggerWinston } from "./logger/infra/logger-winston";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";

export function getContext() {
  const logger = new LoggerWinston();
  return {
    logger,
    moduleRepo: new ModuleRepoSupabase(supabase, logger),
    authRepo: new AuthRepoSupabase(supabase, logger),
    userRepo: new UserRepoSupabase(supabase, logger),
    // add others ...
  };
}
export type OppSysContext = ReturnType<typeof getContext>;
```

We throw a generic error to the client, and log the actual error on the server. This is to avoid leaking sensitive information to the client.

### Utility lib

Utility lib is located at @apps/api/src/lib

## Technologies

- "@supabase/supabase-js": "^2.58.0",
- firebase-functions: "^6.0.1",
- zod: ^4.1.11
- hono: "^4.9.9"
- @hono/zod-validato": "^0.7.3",
