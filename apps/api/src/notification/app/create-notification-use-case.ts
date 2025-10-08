import { buildUseCase } from "src/lib/use-case-builder";
import { NotificationSchema } from "../domain/notification";
import z from "zod";

export const CreateNotificationSchema = NotificationSchema.omit({
  createdAt: true,
  id: true,
  readAt: true,
  expiresAt: true,
}).extend({
  expiresAt: z.iso.datetime().optional(),
});

export const createNotificationUseCase = buildUseCase()
  .input(CreateNotificationSchema)
  .handle(async (ctx, input) => {
    const expiresAt =
      input.expiresAt ??
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
    const notificationResult = await ctx.notificationRepo.create({
      ...input,
      expiresAt,
    });
    return notificationResult;
  });
