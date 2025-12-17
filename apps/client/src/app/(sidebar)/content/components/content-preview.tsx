import { ExternalLink, Eye } from "lucide-react";
import type { Content } from "../content-types";
import { HtmlPreview } from "./html-preview";
import {
  PreviewArticleWriter,
  PreviewDocumentGenerator,
  PreviewRealEstate,
  PreviewSocialFactory,
} from "./previewer";

export const ContentPreview = ({ content }: ContentPreviewProps) => {
  const moduleSlug = content.moduleSlug;

  if (moduleSlug === "real-estate-lease-generator") {
    return <PreviewRealEstate content={content} />;
  }

  // Module article-write
  if (moduleSlug === "ai-writer") {
    return <PreviewArticleWriter content={content} />;
  }

  if (moduleSlug === "social-factory") {
    return <PreviewSocialFactory content={content} />;
  }

  if (moduleSlug === "document-generator") {
    return <PreviewDocumentGenerator content={content} />;
  }

  if (content.htmlPreview) {
    return <HtmlPreview html={content.htmlPreview} />;
  }

  return (
    <div className="text-center py-8">
      <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Aucun aperçu disponible.</p>
      <p className="text-xs text-muted-foreground mt-1">
        Type: {content.type} | Module: {moduleSlug}
      </p>

      {content.filePath && (
        <div className="mt-4">
          <a
            href={content.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir le fichier
          </a>
        </div>
      )}
    </div>
  );
};

interface ContentPreviewProps {
  content: Content;
}
