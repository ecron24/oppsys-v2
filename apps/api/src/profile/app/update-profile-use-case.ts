import { buildUseCase } from "src/lib/use-case-builder";
import { UpdateProfileSchema } from "../domain/profile";
import { z } from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const UpdateProfileUseCaseSchema = z.object({
  body: UpdateProfileSchema,
  user: UserInContextSchema,
});

export const updateProfileUseCase = buildUseCase()
  .input(UpdateProfileUseCaseSchema)
  .handle(async (ctx, data) => {
    const profile = await ctx.profileRepo.update(data.user.id, data.body);
    return profile;
  });
