import type { N8nInput, N8nModule } from "./n8n-type";

export function determineTriggerType(
  module: N8nModule,
  input: N8nInput
): "CHAT" | "STANDARD" {
  // 1. Mode chat explicitement demandé
  if (input.isChatMode && input.sessionId && input.message) {
    return "CHAT";
  }

  // 2. Type défini sur le module
  if (module.n8n_trigger_type === "CHAT") {
    return "CHAT";
  }

  // 3. Détection par endpoint
  if (module.endpoint && module.endpoint.endsWith("/chat")) {
    return "CHAT";
  }

  // 4. Modules spécifiques toujours en mode chat
  const chatModules = ["social-factory", "email-campaign", "article-writer"];
  if (chatModules.includes(module.slug)) {
    return "CHAT";
  }

  // Par défaut : STANDARD
  return "STANDARD";
}
