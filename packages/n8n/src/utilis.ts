export function extractMessageFromN8n(result: any) {
  let extractedMessage = "";

  if (result) {
    if (
      result.output &&
      typeof result.output === "string" &&
      result.output.trim()
    ) {
      extractedMessage = result.output.trim();
    } else if (
      result.response &&
      typeof result.response === "string" &&
      result.response.trim()
    ) {
      extractedMessage = result.response.trim();
    } else if (
      result.message &&
      typeof result.message === "string" &&
      result.message.trim()
    ) {
      extractedMessage = result.message.trim();
    } else if (result.data && typeof result.data === "object") {
      if (result.data.output && typeof result.data.output === "string") {
        extractedMessage = result.data.output.trim();
      } else if (
        result.data.message &&
        typeof result.data.message === "string"
      ) {
        extractedMessage = result.data.message.trim();
      } else if (
        result.data.response &&
        typeof result.data.response === "string"
      ) {
        extractedMessage = result.data.response.trim();
      }
    } else if (Array.isArray(result) && result.length > 0 && result[0]) {
      const firstItem = result[0];
      if (firstItem.output) extractedMessage = firstItem.output;
      else if (firstItem.message) extractedMessage = firstItem.message;
      else if (firstItem.response) extractedMessage = firstItem.response;
    } else if (typeof result === "string" && result.trim()) {
      extractedMessage = result.trim();
    } else {
      console.log("❌ AUCUNE SOURCE DE MESSAGE TROUVÉE");
      console.log(
        "🔍 Structure complète result:",
        JSON.stringify(result, null, 2)
      );
    }
  } else {
    console.log("❌ Result est null/undefined");
  }

  return extractedMessage;
}
