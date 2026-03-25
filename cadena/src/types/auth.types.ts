export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  profile_photo: string;
  skills: string[];
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface UpdateProfileDto {
  phone?: string;
  email?: string;
  address?: string;
  skills?: string[];
}

export interface ProfileChange {
  activity_id: string;
  field: string;
  old_value: string;
  new_value: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  device: string;
  ip_address: string;
  created_at: string;
  changes: ProfileChange[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
