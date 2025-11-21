import { useMutation } from "@tanstack/react-query";
import { toast } from "@oppsys/ui";
import { userService } from "@/components/auth/services/user-service";
import { useAuthOperations } from "@/components/auth/hooks/use-auth-operations";
import type { GeneralForm, SecurityForm } from "../profile-types";
import { useAuth } from "@/components/auth/hooks/use-auth";
import {
  queryClient,
  queryKeys,
} from "@/components/tanstack-query/query-client";

export const useProfile = () => {
  const { user } = useAuth();
  const { updatePassword } = useAuthOperations();

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<GeneralForm>) => {
      const result = await userService.updateProfile({
        fullName: updates.fullName,
        language: updates.language,
        timezone: updates.timezone,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: SecurityForm) => {
      const result = await updatePassword.mutateAsync(data.newPassword);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Mot de passe mis à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors du changement de mot de passe");
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      await userService.exportUserData(user);
    },
    onSuccess: () => {
      toast.success("Données exportées avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'export des données");
    },
  });

  return {
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    changePasswordMutation,
    exportData: () => exportDataMutation.mutate(),
    isUpdating: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isExporting: exportDataMutation.isPending,
  };
};
