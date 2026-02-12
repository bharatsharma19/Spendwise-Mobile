import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { UpdatePreferencesDto, UpdateProfileDto } from "../types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => userApi.updateProfile(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesDto) => userApi.updatePreferences(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
