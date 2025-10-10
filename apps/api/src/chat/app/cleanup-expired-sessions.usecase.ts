import { buildUseCase } from "src/lib/use-case-builder";

export const cleanupExpiredSessionsUseCase = buildUseCase().handle((ctx) => {
  return ctx.chatSessionRepo.cleanupExpiredSessions();
});
