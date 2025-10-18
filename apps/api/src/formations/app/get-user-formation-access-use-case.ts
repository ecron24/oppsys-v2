import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import type { OppSysContext } from "src/get-context";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const GetUserFormationAccessInputSchema = z.object({
  user: UserInContextSchema,
});

export type GetUserFormationAccessInput = z.infer<
  typeof GetUserFormationAccessInputSchema
>;

export const getUserFormationAccessUseCase = buildUseCase()
  .input(GetUserFormationAccessInputSchema)
  .handle(async (ctx: OppSysContext, input) => {
    const { id: userId } = input.user;

    const accessResult = await ctx.formationRepo.getAllFormationsAccess({
      userId,
    });
    if (!accessResult.success) return accessResult;

    return {
      success: true,
      data: accessResult.data,
    };
  });
