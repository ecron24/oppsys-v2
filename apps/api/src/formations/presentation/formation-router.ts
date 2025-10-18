import { Hono } from "hono";
import { honoRouter } from "../../lib/hono-router";
import { zValidatorWrapper } from "../../lib/validator-wrapper";
import { handleResultResponse } from "../../lib/handle-result-response";
import {
  GetFormationContentBody,
  getFormationContentUseCase,
} from "../app/get-formation-content-use-case";
import { getUserFormationAccessUseCase } from "../app/get-user-formation-access-use-case";
import { getUserInContext } from "src/lib/get-user-in-context";

export const formationRouter = honoRouter((ctx) => {
  const router = new Hono()
    // Récupérer le contenu d'une formation (avec achat automatique)
    .post(
      "/get-content",
      zValidatorWrapper("json", GetFormationContentBody),
      async (c) => {
        const user = getUserInContext(c);
        const body = c.req.valid("json");
        const result = await getFormationContentUseCase(ctx, { body, user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    // Récupérer les accès formations de l'utilisateur
    .get("/user-access", async (c) => {
      const user = getUserInContext(c);
      const result = await getUserFormationAccessUseCase(ctx, { user });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    });

  return router;
});
