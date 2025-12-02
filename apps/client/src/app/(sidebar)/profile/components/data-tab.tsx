import { useAuth } from "@/components/auth/hooks/use-auth";
import { useProfile } from "../hooks/use-profile";
import { Button } from "@oppsys/ui/components/button";
import { H3, H4, P } from "@oppsys/ui/components/typography";
import { LoadingSpinner } from "@/components/loading";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteAccountModal } from "./delete-account-modal";

export const DataTab = () => {
  const { user } = useAuth();
  const { exportData, isExporting } = useProfile();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        clientId={user?.id}
      />

      <div>
        <H3 className="mb-4 text-lg font-medium text-card-foreground">
          Gestion des données
        </H3>

        <div className="space-y-6">
          {/* Export des données */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start space-x-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <H4 className="font-medium text-card-foreground">
                  Exporter mes données
                </H4>
                <P className="mb-3 mt-1 text-sm text-muted-foreground">
                  Téléchargez une copie de toutes vos données
                </P>
                <Button
                  onClick={() => user?.id && exportData()}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Exporter les données</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Suppression du compte */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start space-x-4">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <H4 className="font-medium text-destructive">
                  Supprimer mon compte
                </H4>
                <P className="mb-3 mt-1 text-sm text-destructive/80">
                  Suppression définitive de toutes vos données
                </P>
                <Button
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={isExporting}
                  variant="destructive"
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>Supprimer le compte</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
