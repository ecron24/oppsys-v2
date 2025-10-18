import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { GetTemplatesQuerySchema } from "../domain/template";

export const GetTemplatesUseCaseInputSchema = z.object({
  query: GetTemplatesQuerySchema,
});

export const getTemplatesUseCase = buildUseCase()
  .input(GetTemplatesUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { query } = input;
    const result = await ctx.templateRepo.getTemplates(query);
    if (!result.success) return result;

    return {
      success: true,
      data: result.data,
    };
  });
