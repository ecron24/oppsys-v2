import type { Content, ContentMetadata } from "../content-types";

export const getCorrectModuleSlug = (content: Content): string => {
  if (content.metadata?.targetModuleSlug) {
    return content.metadata.targetModuleSlug.toString();
  }
  if (content.moduleSlug) {
    return content.moduleSlug;
  }
  if (content.modules?.slug) {
    return content.modules.slug;
  }

  const title = (content.title || "").toLowerCase();
  if (title.includes("facebook")) return "facebook";
  if (title.includes("instagram")) return "instagram-post";
  if (title.includes("linkedin")) return "linkedin-article";
  if (title.includes("twitter") || title.includes("x ")) return "x-twitter";

  if (content.type === "social_post" || content.type === "social-post") {
    if (content.metadata) {
      const metadata = content.metadata as ContentMetadata;
      const networks = metadata.networks || metadata.selectedNetworks;
      if (networks && Array.isArray(networks)) {
        if (networks.includes("facebook")) return "facebook";
        if (networks.includes("instagram")) return "instagram-post";
        if (networks.includes("linkedin")) return "linkedin-article";
        if (networks.includes("twitter") || networks.includes("x"))
          return "x-twitter";
      }
      if (metadata.targetPlatform) {
        const platform = metadata.targetPlatform.toLowerCase();
        const platformMapping: Record<string, string> = {
          facebook: "facebook",
          instagram: "instagram-post",
          linkedin: "linkedin-article",
          twitter: "x-twitter",
          x: "x-twitter",
        };
        const mappedModule = platformMapping[platform];
        if (mappedModule) return mappedModule;
      }
    }
    return "social-factory";
  }

  const typeMapping: Record<string, string> = {
    article: "article-writer",
    document: "document-generator",
    video: "youtube-uploader",
    audio: "transcription",
  };

  if (content.type && typeMapping[content.type]) {
    return typeMapping[content.type];
  }

  return "social-factory";
};

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

  let postContent = "";
  let hashtags: string[] = [];
  let callToAction = "";
  let emojis = "";
  let platform = "Social Media";
  let hasError = false;
  let foundSource: string | null = null;

  const contentSources = [
    { source: "metadata.post_content", value: metadata.post_content },
    { source: "metadata.content", value: metadata.content },
    { source: "metadata.caption", value: metadata.caption },
    {
      source: "metadata.generated_content.post",
      value: metadata.generatedContent?.post,
    },
    {
      source: "metadata.generated_content.caption",
      value: metadata.generatedContent?.caption,
    },
    {
      source: "metadata.generated_content.content",
      value: metadata.generatedContent?.content,
    },
    { source: "content.content", value: content.content },
    { source: "content.html_preview", value: content.htmlPreview },
    // { source: "content.preview", value: content.preview },
    { source: "metadata.output.post", value: metadata.output?.post },
    { source: "metadata.result.post", value: metadata.result?.post },
    {
      source: "metadata.result.content",
      value: metadata.result?.content,
    },
    {
      source: "metadata.workflow_result.post",
      value: metadata.workflowResult?.post,
    },
    // {
    //   source: "metadata.execution_result.content",
    //   value: metadata.workflowResult?.content,
    // },
  ];

  for (const sourceInfo of contentSources) {
    const value = sourceInfo.value;
    if (value && typeof value === "string" && value.trim().length > 0) {
      if (value.includes("<") && value.includes(">")) {
        try {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = value;
          const extractedText = tempDiv.textContent || tempDiv.innerText || "";
          if (extractedText.trim()) {
            postContent = extractedText.trim();
            foundSource = `${sourceInfo.source} (extracted from HTML)`;
            break;
          }
        } catch (e) {
          console.error("Erreur extraction HTML:", e);
        }
      }

      if (value.startsWith("{") && value.endsWith("}")) {
        try {
          const parsedValue = JSON.parse(value);
          const possibleContent =
            parsedValue.post || parsedValue.caption || parsedValue.content;
          if (possibleContent) {
            postContent = possibleContent;
            foundSource = `${sourceInfo.source} (parsed JSON)`;

            hashtags = parsedValue.hashtags
              ? parsedValue.hashtags
                  .split(" ")
                  .filter((tag: string) => tag.startsWith("#"))
              : [];
            callToAction = parsedValue.call_to_action || parsedValue.cta || "";
            emojis = Array.isArray(parsedValue.emojis)
              ? parsedValue.emojis.join(" ")
              : parsedValue.emojis || "";
            break;
          }
        } catch (e) {
          console.error("Erreur parsing JSON:", e);
        }
      }

      postContent = value;
      foundSource = sourceInfo.source;
      break;
    }
  }

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
    foundSource,
  };
};
