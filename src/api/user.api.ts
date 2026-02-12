import {
  ApiResponse,
  UpdatePreferencesDto,
  UpdateProfileDto,
  UserProfile,
} from "../types";
import apiClient from "./axios";

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response =
      await apiClient.get<ApiResponse<UserProfile>>("/users/profile");
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await apiClient.put<ApiResponse<UserProfile>>(
      "/users/profile",
      data,
    );
    return response.data.data;
  },

  updatePreferences: async (
    data: UpdatePreferencesDto,
  ): Promise<UserProfile> => {
    const response = await apiClient.put<ApiResponse<UserProfile>>(
      "/users/preferences",
      data,
    );
    return response.data.data;
  },
};
