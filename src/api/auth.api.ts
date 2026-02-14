import {
  ApiResponse,
  RegisterDto,
  RegisterResponse,
  UserProfile,
} from "../types";
import apiClient from "./axios";
import { supabase } from "./supabase";

export const authApi = {
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      data,
    );
    return response.data.data;
  },

  resetPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { email });
  },

  verifyPhone: async (phoneNumber: string): Promise<void> => {
    await apiClient.post("/auth/verify-phone", { phoneNumber });
  },

  verifyPhoneCode: async (
    phoneNumber: string,
    code: string,
  ): Promise<{ actionLink?: string }> => {
    const response = await apiClient.post<{ data: { actionLink?: string } }>(
      "/auth/verify-phone-code",
      { phoneNumber, code },
    );
    return response.data.data;
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Backend logout is best-effort
    }
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/auth/me");
    return response.data.data;
  },

  getSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },
};
