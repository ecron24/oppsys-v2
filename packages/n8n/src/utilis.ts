import type { N8nResult } from "./n8n-type";

export function extractMessageFromN8n(result: N8nResult) {
  if (
    result.module_type == "ai-writer" ||
    result.module_type == "email-campaign" ||
    result.module_type == "talent-analyzer"
  ) {
    return result.output.question;
  }

  if (result.module_type == "document-generator") {
    return "Document generated";
  }

  if (result.module_type == "social-factory") {
    return "Post generated";
  }

  return "Module not working for now";
}
