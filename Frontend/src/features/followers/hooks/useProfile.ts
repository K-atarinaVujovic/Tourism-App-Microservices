import { useMutation } from "@tanstack/react-query";

export function useFollowUser() {
  return useMutation({
    mutationFn: async (userId: number) => {
      // TODO: replace with actual API call, place the api call here
      console.log("follow user", userId);
    },
    onError: () => {
      alert("Failed to follow user.");
    },
  });
}