import type { Result } from "@oppsys/utils";
import type { OppSysContext } from "src/get-context";
import { z } from "zod";
import type { ZodType } from "zod";
import { ZodError } from "zod";

export type DefaultErrorKind =
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "SCHEMA_ERROR";

export function buildUseCase<Kind extends string = DefaultErrorKind>() {
  return new UseCaseBuilder<unknown, unknown, Kind | DefaultErrorKind>();
}

export type BuilderResult<T, Kind extends string = DefaultErrorKind> = Result<
  T,
  Error | ZodError,
  Kind | DefaultErrorKind
>;

export class UseCaseBuilder<
  Input = unknown,
  Output = unknown,
  Kind extends string = DefaultErrorKind,
> {
  private inputSchema?: ZodType<Input>;
  private outputSchema?: ZodType<Output>;
  private handler?: (
    ctx: OppSysContext,
    input: Input
  ) => Promise<BuilderResult<Output, Kind>>;

  input<T extends ZodType<Input>>(schema: T) {
    this.inputSchema = schema;
    return this as unknown as UseCaseBuilder<z.infer<T>, Output, Kind>;
  }

  output<T extends ZodType<Output>>(schema: T) {
    this.outputSchema = schema;
    return this as unknown as UseCaseBuilder<Input, z.infer<T>, Kind>;
  }

  handle<NewKind extends string = DefaultErrorKind, O = Output>(
    cb: (
      ctx: OppSysContext,
      input: Input
    ) => Promise<
      | BuilderResult<O, Kind | NewKind | DefaultErrorKind>
      | {
          success: false;
          error: Error;
          kind: NewKind;
        }
    >
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.handler = cb as any;

    return async (
      ctx: OppSysContext,
      rawInput: Input
    ): Promise<BuilderResult<O, Kind | NewKind | DefaultErrorKind>> => {
      try {
        if (!this.handler)
          return {
            success: false,
            error: new Error("Handler not defined"),
            kind: "SCHEMA_ERROR",
          };

        const input = this.inputSchema
          ? this.inputSchema.parse(rawInput)
          : (rawInput as Input);
        const output = await this.handler(ctx, input);

        if (output.success == false) {
          return output;
        }

        if (this.outputSchema) {
          const parsedOutput = this.outputSchema.parse(output.data);
          return { success: true, data: parsedOutput as unknown as O };
        }
        return { success: true, data: output.data as unknown as O };
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
