import { useAuth } from "@/components/auth/hooks/use-auth";

export function useCredits() {
  const { user } = useAuth();
  const balance = user?.creditBalance || 0;
  return {
    balance,
    hasEnoughCredits: (amount: number) => balance >= amount,
    formatBalance: () => balance.toLocaleString("fr-FR"),
    isLowBalance: (threshold = 10) => balance <= threshold,
  };
}
