import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  H3,
  P,
} from "@oppsys/ui";
import { Input, Label } from "@oppsys/ui";
import { Calendar, Crown } from "lucide-react";
import { toast } from "@oppsys/ui";
import { LoadingSpinner } from "@/components/loading";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import type { Content } from "../content-types";
import { LinkButton } from "@/components/link-button";

export const SchedulingDialog = ({
  isOpen,
  onClose,
  content,
  onSchedule,
}: SchedulingDialogProps) => {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(false);
  const permissions = usePremiumFeatures();

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error("Veuillez sélectionner une date et une heure.");
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error("La date doit être dans le futur.");
      return;
    }

    setLoading(true);
    try {
      await onSchedule(content?.id || "", scheduledDateTime.toISOString());
      toast.success("Contenu planifié avec succès !", {
        description: `Publication prévue le ${scheduledDateTime.toLocaleString()}`,
      });
      onClose();
    } catch (error) {
      console.log("[handleSchedule]:", error);

      toast.error("Erreur lors de la planification.");
    } finally {
      setLoading(false);
    }
  };

  if (!permissions.data?.scheduling.canSchedule) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planification Premium</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Crown className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <H3 className="text-lg font-bold mb-2">Fonctionnalité Premium</H3>
            <P className="text-muted-foreground mb-4">
              La planification de contenu est réservée aux abonnés Premium.
            </P>
          </div>

          <DialogFooter>
            <Button onClick={onClose} variant={"destructive-outline"}>
              Fermer
            </Button>
            <LinkButton to="/billing" className=" bg-gradient-primary">
              <Crown className="h-4 w-4 mr-2" />
              Passer à Premium
            </LinkButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Planifier la publication</DialogTitle>
          <DialogDescription>
            {content?.title || "Contenu sélectionné"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleDate">Date de publication</Label>
              <Input
                id="scheduleDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleTime">Heure de publication</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {scheduledDate && scheduledTime && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Publication prévue le{" "}
                  {new Date(
                    `${scheduledDate}T${scheduledTime}`
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant={"outline"} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={loading || !scheduledDate || !scheduledTime}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Planifier
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type SchedulingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onSchedule: (contentId: string, executionTime: string) => Promise<void>;
};
