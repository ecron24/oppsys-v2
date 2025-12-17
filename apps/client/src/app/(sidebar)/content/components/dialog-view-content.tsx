import type { Content } from "../content-types";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@oppsys/ui/components/dialog";
import { TooltipButton } from "@oppsys/ui/components/tooltip-button";
import { ContentPreview } from "./content-preview";
import { Link } from "react-router";
import { Calendar, Edit, Share2, Trash, XCircle } from "lucide-react";
import type { User } from "@/components/auth/auth-types";

export function DialogViewContent({
  content,
  approvalLoading,
  onClose,
  onDenyAndDelete,
  canSchedule = false,
  user,
  onSchelude,
  onApproveAndPublish,
  onDelete,
}: DialogViewContentProps) {
  const moduleSlug = content.moduleSlug;

  return (
    <Dialog
      open={true}
      onOpenChange={(value) => {
        if (value) {
          return;
        }
        onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  Réseau :{" "}
                  {(() => {
                    return moduleSlug || "Réseau inconnu";
                  })()}
                </span>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg border">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Informations client :
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Nom :</strong> {user?.fullName || "Nom inconnu"}
                  </div>
                  <div>
                    <strong>Email :</strong> {user?.email || "Email inconnu"}
                  </div>
                </div>
              </div>

              {content.metadata?.targetPlatform && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-xs text-blue-800">
                    <strong>Réseau cible détecté :</strong>{" "}
                    {content.metadata.targetPlatform}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Statut: <strong>{content.status}</strong>
                </span>
                <span>
                  Créé: {new Date(content.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ContentPreview content={content} />

        <DialogFooter>
          <div className="w-full mb-4">
            <TooltipButton
              tooltip="Modifier le contenu dans le module d'origine"
              className="w-full"
              variant={"secondary"}
              asChild
            >
              <Link
                to={`/modules/${moduleSlug}?content_id=${content.id}&action=edit`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </TooltipButton>
          </div>

          <div className="flex justify-center space-x-3">
            {content.status === "pending" && (
              <TooltipButton
                tooltip="Refuser et supprimer ce contenu"
                variant={"destructive-outline"}
                size={"icon-lg"}
                onClick={onDenyAndDelete}
                disabled={approvalLoading}
              >
                <XCircle />
              </TooltipButton>
            )}

            {content.filePath && (
              <TooltipButton
                tooltip="Télécharger le fichier"
                variant={"default-outline"}
                size={"icon-lg"}
              >
                <a
                  href={content.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Trash className="h-5 w-5" />
                </a>
              </TooltipButton>
            )}

            {canSchedule && (
              <TooltipButton
                tooltip="Planifier la publication"
                onClick={onSchelude}
                size={"icon-lg"}
              >
                <Calendar className="h-5 w-5" />
              </TooltipButton>
            )}

            {content.type === "social-post" &&
              (content.status === "pending" ||
                content.status === "approved") && (
                <TooltipButton
                  variant={"success"}
                  tooltip="Approuver et publier sur les réseaux sociaux"
                  onClick={onApproveAndPublish}
                >
                  {approvalLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Share2 className="h-5 w-5" />
                  )}
                </TooltipButton>
              )}

            <TooltipButton
              tooltip="Supprimer définitivement"
              variant={"destructive"}
              onClick={onDelete}
            >
              <Trash className="h-5 w-5" />
            </TooltipButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DialogViewContentProps = {
  user: User | null;
  content: Content;
  onClose?: () => void;
  onDenyAndDelete?: () => void;
  approvalLoading?: boolean;
  canSchedule?: boolean;
  onSchelude?: () => void;
  onApproveAndPublish?: () => void;
  onDelete?: () => void;
};
