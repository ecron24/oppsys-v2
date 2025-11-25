import {
  FileText,
  Share2,
  AlertCircle,
  Clock,
  XCircle,
  TrendingUp,
  Download,
  ExternalLink,
  Eye,
  Copy,
} from "lucide-react";
import {
  getCorrectModuleSlug,
  extractPostContent,
} from "../utils/content-utils";
import type { Content, ContentMetadata } from "../content-types";
import { Button, H4, P, toast } from "@oppsys/ui";

export const ContentPreview = ({ content }: ContentPreviewProps) => {
  const moduleSlug = getCorrectModuleSlug(content);

  if (moduleSlug === "real-estate-lease-generator") {
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <H4 className="font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Document généré
            </H4>
            <div className="text-xs text-muted-foreground">
              {new Date(content.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <strong>Titre :</strong> {content.title}
            </div>
            <div>
              <strong>Type :</strong>{" "}
              {content.metadata?.leaseType || "Bail immobilier"}
            </div>
            <div>
              <strong>Format :</strong>{" "}
              {content.metadata?.outputFormat?.toUpperCase() || "DOCX"}
            </div>
            {content.metadata?.propertyInfo?.address && (
              <div>
                <strong>Adresse :</strong>{" "}
                {content.metadata.propertyInfo.address}
              </div>
            )}
          </div>
        </div>

        {content.metadata && (
          <div className="space-y-3">
            {(content.metadata.ownerInfo || content.metadata.tenantInfo) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.metadata.ownerInfo && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">
                      Propriétaire
                    </h5>
                    <div className="text-sm space-y-1">
                      <div>{content.metadata.ownerInfo.name}</div>
                      {content.metadata.ownerInfo.email && (
                        <div className="text-muted-foreground">
                          {content.metadata.ownerInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {content.metadata.tenantInfo && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">
                      Locataire
                    </h5>
                    <div className="text-sm space-y-1">
                      <div>{content.metadata.tenantInfo.name}</div>
                      {content.metadata.tenantInfo.email && (
                        <div className="text-muted-foreground">
                          {content.metadata.tenantInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {content.metadata.leaseInfo && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h5 className="font-medium text-amber-800 mb-2">
                  Détails du bail
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {content.metadata.leaseInfo.duration && (
                    <div>
                      <strong>Durée :</strong>{" "}
                      {content.metadata.leaseInfo.duration} an(s)
                    </div>
                  )}
                  {content.metadata.leaseInfo.startDate && (
                    <div>
                      <strong>Début :</strong>{" "}
                      {content.metadata.leaseInfo.startDate}
                    </div>
                  )}
                  {content.metadata.propertyInfo?.rent && (
                    <div>
                      <strong>Loyer :</strong>{" "}
                      {content.metadata.propertyInfo.rent}€
                    </div>
                  )}
                  {content.metadata.propertyInfo?.deposit && (
                    <div>
                      <strong>Dépôt :</strong>{" "}
                      {content.metadata.propertyInfo.deposit}€
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {content.filePath && (
              <a
                href={content.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le document
              </a>
            )}

            {content.filePath && content.metadata?.outputFormat === "pdf" && (
              <a
                href={content.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </a>
            )}
          </div>

          {!content.filePath && (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Document en cours de génération...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Module article-write
  if (moduleSlug === "article-writer") {
    // Parser metadata sécurisé
    let metadata: ContentMetadata = {};
    try {
      if (typeof content.metadata === "string") {
        metadata = JSON.parse(content.metadata);
      } else if (content.metadata && typeof content.metadata === "object") {
        metadata = content.metadata;
      } else {
        metadata = {};
      }
    } catch {
      metadata = {};
    }

    // Sources de contenu (ordre prioritaire)
    const htmlContent =
      metadata.content ||
      (metadata.display &&
        typeof metadata.display == "object" &&
        "content" in metadata.display &&
        metadata.display?.content?.toString()) ||
      content.htmlPreview ||
      "";

    return (
      <div className="space-y-4">
        {/* En-tête */}
        <div className="bg-muted/50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <H4 className="font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Article généré
            </H4>
            <div className="text-xs text-muted-foreground">
              {new Date(content.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <strong>Type :</strong>{" "}
              {metadata.contentType?.toString() || "Blog"}
            </div>
            <div>
              <strong>Ton :</strong>{" "}
              {metadata.tone?.toString() || "Professionnel"}
            </div>
            <div>
              <strong>Langue :</strong> {metadata.language?.toString() || "FR"}
            </div>
            <div>
              <strong>Mots :</strong> {metadata.wordCount?.toString() || "N/A"}
            </div>
          </div>

          {metadata.targetKeywords && (
            <div className="mb-3">
              <span className="text-sm font-medium">Mots-clés : </span>
              <span className="text-sm text-muted-foreground">
                {metadata.targetKeywords.toString()}
              </span>
            </div>
          )}
        </div>

        {/* Contenu HTML */}
        {htmlContent ? (
          <div className="bg-white p-6 rounded-lg border max-h-[600px] overflow-y-auto">
            <div
              className="prose prose-sm max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:text-gray-700 prose-li:mb-1
                prose-a:text-blue-600 prose-a:underline
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-800">
                Contenu non disponible
              </h4>
            </div>
            <p className="text-sm text-red-700 mb-3">
              Aucun contenu HTML trouvé. Vérifiez la structure dans la console.
            </p>
            <details className="text-xs">
              <summary className="cursor-pointer text-red-600 font-medium mb-2">
                🔧 DEBUG : Métadonnées complètes
              </summary>
              <pre className="bg-white p-2 rounded border overflow-x-auto max-h-64">
                {JSON.stringify(
                  {
                    metadata,
                    content_type: content.type,
                    module_slug: moduleSlug,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-4 flex space-x-3">
          <Button
            variant={"secondary-outline"}
            onClick={async () => {
              try {
                const textToCopy = htmlContent
                  ? (new DOMParser()
                      .parseFromString(htmlContent, "text/html")
                      .body?.textContent?.trim() ?? "")
                  : "";

                await navigator.clipboard.writeText(textToCopy);
                toast.success("Article copié");
              } catch {
                toast.error("Erreur copie");
              }
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copier
          </Button>

          <Button
            variant={"success"}
            onClick={() => {
              const filename = `${(content.title || "article").replace(/[^a-zA-Z0-9]/g, "_")}.html`;
              const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${metadata.title || content.title}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 p-8">
  <article class="prose prose-lg max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
    ${htmlContent}
  </article>
</body>
</html>`;

              const blob = new Blob([fullHtml], {
                type: "text/html;charset=utf-8",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success("Article téléchargé (HTML)");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>
    );
  }

  // Pour les posts de réseaux sociaux
  if (content.type === "social-post" || moduleSlug === "social-factory") {
    const {
      postContent,
      hashtags,
      callToAction,
      emojis,
      platform,
      hasError,
      foundSource,
    } = extractPostContent(content);

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-bold text-yellow-700 mb-2">
              🔧 DEBUG INFO (cliquez pour voir) - À supprimer une fois résolu
            </summary>
            <div className="space-y-1 text-yellow-800">
              <div>
                <strong>Source trouvée:</strong>{" "}
                {foundSource || "AUCUNE SOURCE TROUVÉE"}
              </div>
              <div>
                <strong>Contenu extrait:</strong>{" "}
                {postContent.substring(0, 200)}...
              </div>
              <div>
                <strong>Plateforme:</strong> {platform}
              </div>
              <div>
                <strong>Hashtags:</strong> {hashtags.join(", ")}
              </div>
              <div>
                <strong>Call to Action:</strong> {callToAction}
              </div>
              <div>
                <strong>Emojis:</strong> {emojis}
              </div>
              <div>
                <strong>A une erreur:</strong> {hasError ? "OUI" : "NON"}
              </div>
            </div>
          </details>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <H4 className="font-medium flex items-center">
              <Share2 className="h-4 w-4 mr-2 text-blue-600" />
              Post {platform}
            </H4>
            <div className="text-xs text-muted-foreground">
              {new Date(content.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border mb-4 ${
              hasError ? "bg-red-50 border-red-200" : "bg-white"
            }`}
          >
            {hasError || !postContent ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div>
                  <P className="text-sm font-medium text-red-800">
                    Problème d'affichage du contenu
                  </P>
                  <P className="text-sm text-red-600">
                    {postContent || "Aucun contenu trouvé dans les métadonnées"}
                  </P>
                  {!foundSource && (
                    <P className="text-xs text-red-500 mt-1">
                      Aucune source de contenu détectée. Vérifiez la structure
                      des données dans la console.
                    </P>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line text-sm font-medium">
                    {postContent}
                  </p>
                </div>

                {emojis && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Emojis :</span>
                    <span className="text-lg">{emojis}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {!hasError && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                Hashtags :
              </span>
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!hasError && callToAction && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-sm font-medium text-amber-800">
                  Call to Action :
                </span>
              </div>
              <p className="text-sm text-amber-700">{callToAction}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t">
            <div>
              <strong>Plateforme :</strong> {platform}
            </div>
            <div>
              <strong>Statut :</strong> {content.status}
            </div>
            <div>
              <strong>Source de contenu :</strong>{" "}
              {foundSource || "Non trouvée"}
            </div>
            <div>
              <strong>Taille métadonnées :</strong>{" "}
              {JSON.stringify(content.metadata || {}).length} caractères
            </div>
          </div>
        </div>

        {content.status === "pending" && (
          <div
            className={`border-t pt-4 flex items-center justify-center p-4 rounded-lg ${
              hasError
                ? "bg-red-50 border border-red-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            {hasError ? (
              <>
                <XCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">
                  Ce contenu a rencontré une erreur lors de l'extraction. Vous
                  pouvez le refuser et réessayer.
                </span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Ce contenu est en attente d'approbation. Utilisez les boutons
                  ci-dessous pour l'approuver ou le refuser.
                </span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (content.htmlPreview) {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content.htmlPreview }}
      />
    );
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
