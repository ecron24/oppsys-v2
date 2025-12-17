import { toast } from "@oppsys/ui";

export async function copyToClipboard(
  textToCopy: string,
  opts?: { name?: string }
) {
  const name = opts?.name ? ` (${opts.name})` : "Texte";
  try {
    await navigator.clipboard.writeText(textToCopy);
    toast.success(`${name} copié`);
  } catch {
    toast.error("Erreur copie");
  }
}

export async function copyHtmlToTextToClipboard(
  htmlContent: string,
  opts?: { name?: string }
) {
  try {
    const textToCopy = htmlContent
      ? (new DOMParser()
          .parseFromString(htmlContent, "text/html")
          .body?.textContent?.trim() ?? "")
      : "";

    await copyToClipboard(textToCopy, opts);
  } catch {
    toast.error("Erreur copie");
  }
}
