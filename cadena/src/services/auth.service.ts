import api from "./api";
import type {
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  AuthTokens,
  User,
  UserActivity,
  ApiResponse,
} from "@/types/auth.types";

const AUTH_ENDPOINT = "/v1/auth";
const PROFILE_ENDPOINT = "/v1/profile";

export const authService = {
  login: async (data: LoginDto): Promise<AuthTokens> => {
    const response = await api.post<ApiResponse<AuthTokens>>(
      `${AUTH_ENDPOINT}/login`,
      data
    );
    return response.data.data;
  },

  register: async (data: RegisterDto): Promise<AuthTokens> => {
    const response = await api.post<ApiResponse<AuthTokens>>(
      `${AUTH_ENDPOINT}/register`,
      data
    );
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post<ApiResponse<AuthTokens>>(
      `${AUTH_ENDPOINT}/refresh`,
      { refresh_token: refreshToken }
    );
    return response.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post(`${AUTH_ENDPOINT}/logout`, {
      refresh_token: refreshToken,
    });
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(PROFILE_ENDPOINT);
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileDto, photo?: File): Promise<User> => {
    const formData = new FormData();

    if (data.phone !== undefined) formData.append("phone", data.phone);
    if (data.email !== undefined) formData.append("email", data.email);
    if (data.address !== undefined) formData.append("address", data.address);
    if (data.skills !== undefined) formData.append("skills", JSON.stringify(data.skills));
    if (photo) formData.append("photo", photo);

    const response = await api.put<ApiResponse<User>>(PROFILE_ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  getHistory: async (days: number = 7): Promise<UserActivity[]> => {
    const response = await api.get<ApiResponse<UserActivity[]>>(
      `${PROFILE_ENDPOINT}/history?days=${days}`
    );
    return response.data.data;
  },
} as const;

