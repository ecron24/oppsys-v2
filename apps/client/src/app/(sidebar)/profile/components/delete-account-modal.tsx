import { useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  Trash2,
  CheckCircle,
  RefreshCw,
  XCircle,
  Lock,
  Mail,
  Database,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent } from "@oppsys/ui";

export function DeleteAccountModal({
  isOpen,
  onClose,
  clientId,
}: DeleteAccountModalProps) {
  const navigate = useNavigate();

  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleDelete = async () => {
    if (!clientId) return;
    if (confirmText !== "DELETE") {
      setError("Le texte de confirmation est incorrect.");
      return;
    }

    setIsDeleting(true);
    setError(null);
    setStep(2);

    try {
      // TODO: use api route to delete account
      //   const { error: deleteError } = await supabase.rpc("delete_user_account", {
      //     user_id: clientId,
      //   });

      //   if (deleteError) throw deleteError;

      setStep(3);

      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (signOutErr) {
          console.warn("Error signing out:", signOutErr);
        }
        navigate("/login", {
          state: {
            message: "Votre compte a été supprimé avec succès.",
            type: "success",
          },
        });
      }, 3000);
    } catch (err) {
      console.error("Error deleting account:", err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(
        error.message || "Une erreur est survenue lors de la suppression."
      );
      setStep(1);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      setError(null);
      setStep(1);
      onClose();
    }
  };

  const renderConfirmationStep = () => (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-destructive/10 p-3 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">
          Supprimer votre compte
        </h2>
      </div>

      <div className="space-y-6 mb-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-2">
                Êtes-vous absolument certain ?
              </h3>
              <p className="text-sm text-destructive/80 mb-3">
                Cette action est définitive et ne peut pas être annulée.
              </p>
              <ul className="space-y-2 text-sm text-destructive/80">
                <li className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Toutes vos données seront effacées.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4" />
                  <span>Votre abonnement sera annulé.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Vous perdrez l'accès à la plateforme.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Vos connexions sociales seront supprimées.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Aucune récupération ne sera possible.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-3">
            Pour confirmer, tapez le mot{" "}
            <span className="font-bold text-destructive">DELETE</span> :
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError(null);
            }}
            placeholder="DELETE"
            className={`w-full bg-background border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${confirmText === "DELETE" ? "border-green-500 focus:ring-green-500" : "border-border focus:ring-destructive"}`}
            disabled={isDeleting}
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting || confirmText !== "DELETE"}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          Je comprends, supprimer mon compte
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-card-foreground mb-3">
        Suppression de votre compte
      </h2>
      <p className="text-muted-foreground mb-6">
        Veuillez patienter pendant que nous supprimons vos données de manière
        sécurisée.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Déconnexion sécurisée de tous les appareils</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Déconnexion de vos comptes sociaux</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Effacement de vos données personnelles</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-card-foreground mb-3">
        Compte supprimé avec succès
      </h2>
      <p className="text-muted-foreground mb-4">
        Nous sommes désolés de vous voir partir. Vous allez être redirigé.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-700 flex items-center justify-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Redirection en cours...</span>
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return;
        handleClose();
      }}
    >
      <DialogContent>
        <div className="bg-card text-card-foreground">
          {step === 1 && renderConfirmationStep()}
          {step === 2 && renderProcessingStep()}
          {step === 3 && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type DeleteAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
};
