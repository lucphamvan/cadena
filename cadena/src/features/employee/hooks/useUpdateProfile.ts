import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UpdateProfileDto } from "@/types/auth.types";
import { HISTORY_QUERY_KEY } from "./useChangeHistory";

interface UpdateProfileParams {
  readonly data: UpdateProfileDto;
  readonly photo?: File;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async ({ data, photo }: UpdateProfileParams) =>
      await authService.updateProfile(data, photo),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY] });
    },
  });
};
