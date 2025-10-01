import { z } from "zod";
import type { ZodType } from "zod";
import { ZodError } from "zod";
import type { FnContext } from "./fn-context";

type DefaultErrorKind = "VALIDATION_ERROR" | "INTERNAL_ERROR" | "SCHEMA_ERROR";

export function createFn<
  InputSchema extends ZodType<any>,
  OutputSchema extends ZodType<any>,
  CustomKind extends string = string,
>({
  input,
  output,
  handle,
}: {
  input: InputSchema;
  output: OutputSchema;
  handle: (
    ctx: FnContext,
    input: z.infer<InputSchema>
  ) => Promise<
    | z.infer<OutputSchema>
    | { success: false; error: Error; kind: CustomKind | DefaultErrorKind }
  >;
}) {
  const builder = new FnBuilder<
    z.infer<InputSchema>,
    z.infer<OutputSchema>,
    CustomKind | DefaultErrorKind
  >()
    .input(input)
    .output(output)
    .handle(handle);
  return builder;
}

export type BuilderResult<T, Kind extends string = string> =
  | ({ success: true; data: T } & { kind?: undefined; error?: undefined })
  | ({
      success: false;
      error: ZodError | Error;
      kind: Kind | DefaultErrorKind;
    } & { data?: undefined });

export class FnBuilder<
  Input = unknown,
  Output = unknown,
  Kind extends string = string,
> {
  private inputSchema?: ZodType<Input>;
  private outputSchema?: ZodType<Output>;
  private handler?: (
    ctx: FnContext,
    input: Input
  ) => Promise<Output | { success: false; error: Error; kind: Kind }>;

  input(schema: ZodType<Input>) {
    this.inputSchema = schema;
    return this as FnBuilder<Input, Output, Kind>;
  }

  output(schema: ZodType<Output>) {
    this.outputSchema = schema;
    return this as FnBuilder<Input, Output, Kind>;
  }

  handle(
    cb: (
      ctx: FnContext,
      input: Input
    ) => Promise<Output | { success: false; error: Error; kind: Kind }>
  ) {
    this.handler = cb;
    return async (
      ctx: FnContext,
      rawInput: unknown
    ): Promise<BuilderResult<Output, Kind>> => {
      try {
        if (!this.inputSchema)
          throw {
            error: new Error("Input schema not defined"),
            kind: "SCHEMA_ERROR",
          };
        if (!this.outputSchema)
          throw {
            error: new Error("Output schema not defined"),
            kind: "SCHEMA_ERROR",
          };
        if (!this.handler)
          throw {
            error: new Error("Handler not defined"),
            kind: "SCHEMA_ERROR",
          };

        const input = this.inputSchema.parse(rawInput);
        const output = await this.handler(ctx, input);

        // If the handler returns an error object with kind
        if (
          typeof output === "object" &&
          output !== null &&
          "success" in output &&
          output.success === false &&
          "error" in output &&
          "kind" in output
        ) {
          return output as BuilderResult<Output, Kind>;
        }

        const parsedOutput = this.outputSchema.parse(output);
        return { success: true, data: parsedOutput };
      } catch (error: any) {
        // If error has kind, use it
        if (
          error &&
          typeof error === "object" &&
          "kind" in error &&
          "error" in error
        ) {
          return {
            success: false,
            error: error.error,
            kind: error.kind,
          };
        }
        return {
          success: false,
          error: error as ZodError | Error,
          kind:
            error instanceof ZodError
              ? ("VALIDATION_ERROR" as Kind)
              : ("INTERNAL_ERROR" as Kind),
        };
      }
    };
  }
}
