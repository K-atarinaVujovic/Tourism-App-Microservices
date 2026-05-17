import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "../services/stakeholdersService";
import type { UpdateProfile } from "@/types/stakeholders";

export function useProfile(userId: number) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
  });
}

export function useUpdateProfile(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfile) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: () => {
      alert("Failed to update profile.");
    },
  });
}