import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, blockUser, unblockUser } from "../services/authService";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsers,
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => blockUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: () => alert("Failed to block user."),
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => unblockUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: () => alert("Failed to unblock user."),
  });
}