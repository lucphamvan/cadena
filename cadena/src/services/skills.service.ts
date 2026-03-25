import api from "./api";
import type { ApiResponse } from "@/types/auth.types";

const ENDPOINT = "/v1/skills";

export const skillsService = {
  getAll: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>(ENDPOINT);
    return response.data.data;
  },
} as const;
