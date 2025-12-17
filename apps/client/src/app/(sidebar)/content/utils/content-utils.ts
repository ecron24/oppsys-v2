import type { Content, ContentMetadata } from "../content-types";

export const parseMetadata = (
  metadata: ContentMetadata | string
): ContentMetadata => {
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch (e) {
      console.error("❌ Erreur parsing metadata:", e);
      return {};
    }
  }
  return metadata || {};
};

export const extractPostContent = (
  content: Content
): {
  postContent: string;
  hashtags: string[];
  callToAction: string;
  emojis: string;
  platform: string;
  hasError: boolean;
  foundSource: string | null;
} => {
  const metadata = parseMetadata(content.metadata || {});

  const postContent =
    content.htmlPreview?.toString() || metadata.htmlPreview?.toString() || "";
  let hashtags: string[] = [];
  let callToAction = "";
  let emojis = "";
  let platform = "Social Media";
  let hasError = false;

  if (!hashtags.length) {
    const hashtagSources = [
      metadata.hashtags,
      metadata.generatedContent?.hashtags,
      metadata.tags,
    ];
    for (const tags of hashtagSources) {
      if (tags) {
        if (Array.isArray(tags)) {
          hashtags = tags as string[];
          break;
        } else if (typeof tags === "string") {
          hashtags = tags
            .split(/\s+/)
            .filter((tag: string) => tag.startsWith("#"));
          if (hashtags.length) break;
        }
      }
    }
  }

  if (!callToAction) {
    callToAction =
      metadata.callToAction ||
      metadata.callToAction ||
      metadata.cta ||
      metadata.generatedContent?.callToAction ||
      "";
  }

  if (!emojis) {
    const emojiValue = metadata.emojis || metadata.generatedContent?.emojis;
    if (Array.isArray(emojiValue)) {
      emojis = emojiValue.join(" ");
    } else if (emojiValue) {
      emojis = emojiValue;
    }
  }

  platform =
    metadata.platform ||
    metadata.targetPlatform ||
    (metadata.networks && metadata.networks[0]) ||
    (metadata.selectedNetworks && metadata.selectedNetworks[0]) ||
    "Social Media";

  hasError =
    !postContent ||
    postContent === "Contenu non disponible" ||
    postContent.toLowerCase().includes("erreur") ||
    Boolean(metadata.errorDetails);

  return {
    postContent,
    hashtags,
    callToAction,
    emojis,
    platform,
    hasError,
    foundSource: "html",
  };
};
