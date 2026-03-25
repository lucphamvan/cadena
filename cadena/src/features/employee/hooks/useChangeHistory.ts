import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";

export const HISTORY_QUERY_KEY = "profile_history" as const;

export const useChangeHistory = (days: number = 7) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [HISTORY_QUERY_KEY, days],
    queryFn: async () => await authService.getHistory(days),
    enabled: isAuthenticated,
  });
};
