import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";

const PROFILE_QUERY_KEY = "profile" as const;

export const useProfile = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: async () => await authService.getProfile(),
    enabled: isAuthenticated,
  });
};
