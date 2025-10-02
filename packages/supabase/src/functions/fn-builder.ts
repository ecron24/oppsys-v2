import { z } from "zod";
import type { ZodType } from "zod";
import { ZodError } from "zod";
import type { FnContext } from "./fn-context";
import type { Result } from "@oppsys/types";

type DefaultErrorKind = "VALIDATION_ERROR" | "INTERNAL_ERROR" | "SCHEMA_ERROR";

export function createFn<Kind extends string = DefaultErrorKind>() {
  return new FnBuilder<unknown, unknown, Kind | DefaultErrorKind>();
}

export type BuilderResult<T, Kind extends string = DefaultErrorKind> = Result<
  T,
  Error | ZodError,
  Kind | DefaultErrorKind
>;

export class FnBuilder<
  Input = unknown,
  Output = unknown,
  Kind extends string = DefaultErrorKind,
> {
  private inputSchema?: ZodType<Input>;
  private outputSchema?: ZodType<Output>;
  private handler?: (
    ctx: FnContext,
    input: Input
  ) => Promise<BuilderResult<Output, Kind>>;

  input<T extends ZodType<any>>(schema: T) {
    this.inputSchema = schema;
    return this as unknown as FnBuilder<z.infer<T>, Output, Kind>;
  }

  output<T extends ZodType<any>>(schema: T) {
    this.outputSchema = schema;
    return this as unknown as FnBuilder<Input, z.infer<T>, Kind>;
  }

  handle<NewKind extends string = DefaultErrorKind>(
    cb: (
      ctx: FnContext,
      input: Input
    ) => Promise<
      | BuilderResult<Output, Kind | DefaultErrorKind>
      | {
          success: false;
          error: Error;
          kind: NewKind;
        }
    >
  ) {
    this.handler = cb as any;

    return async (
      ctx: FnContext,
      rawInput: Input
    ): Promise<BuilderResult<Output, Kind | NewKind | DefaultErrorKind>> => {
      try {
        if (!this.inputSchema)
          return {
            success: false,
            error: new Error("Input schema not defined"),
            kind: "SCHEMA_ERROR",
          };
        if (!this.outputSchema)
          return {
            success: false,
            error: new Error("Output schema not defined"),
            kind: "SCHEMA_ERROR",
          };
        if (!this.handler)
          return {
            success: false,
            error: new Error("Handler not defined"),
            kind: "SCHEMA_ERROR",
          };

        const input = this.inputSchema.parse(rawInput) as Input;
        const output = await this.handler(ctx, input);

        if (output.success == false) {
          return output;
        }

        const parsedOutput = this.outputSchema.parse(output.data);
        return { success: true, data: parsedOutput };
      } catch (error: unknown) {
        return {
          success: false,
          error: error as ZodError | Error,
          kind:
            error instanceof ZodError
              ? ("VALIDATION_ERROR" as Kind | NewKind | DefaultErrorKind)
              : ("INTERNAL_ERROR" as Kind | NewKind | DefaultErrorKind),
        };
      }
    };
  }
}
