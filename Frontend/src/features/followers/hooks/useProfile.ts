import { useMutation } from "@tanstack/react-query";

export function useFollowUser() {
  return useMutation({
    mutationFn: async (userId: number) => {
      // TODO: replace with actual API call
      console.log("follow user", userId);
    },
    onError: () => {
      alert("Failed to follow user.");
    },
  });
}