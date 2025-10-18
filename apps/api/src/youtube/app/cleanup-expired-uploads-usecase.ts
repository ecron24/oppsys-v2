import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";

export const CleanupExpiredUploadsInputSchema = z.object({
  user: UserInContextSchema,
});

export type CleanupExpiredUploadsInput = z.infer<
  typeof CleanupExpiredUploadsInputSchema
>;

export const cleanupExpiredUploadsUseCase = buildUseCase()
  .input(CleanupExpiredUploadsInputSchema)
  .handle(async (ctx, input) => {
    const { user } = input;

    // Check if user is admin
    if (user.role !== "admin") {
      return {
        success: false,
        kind: "FORBIDDEN",
        error: new Error("Admin permissions required"),
      } as const;
    }

    const result = await ctx.youtubeRepo.cleanupExpiredUploads();

    return result;
  });
