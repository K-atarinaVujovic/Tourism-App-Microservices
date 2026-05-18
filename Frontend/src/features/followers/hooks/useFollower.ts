import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  follow, unfollow, isFollowing,
  getFollowers, getFollowing,
  getFollowerBlogs, getRecommendations,
} from "../services/followerService";

export function useIsFollowing(userId2: number) {
  return useQuery({
    queryKey: ["is-following", userId2],
    queryFn: () => isFollowing(userId2),
  });
}

export function useFollowers() {
  return useQuery({ queryKey: ["followers"], queryFn: getFollowers });
}

export function useFollowing() {
  return useQuery({ queryKey: ["following"], queryFn: getFollowing });
}

export function useFollowerBlogs() {
  return useQuery({ queryKey: ["follower-blogs"], queryFn: getFollowerBlogs });
}

export function useRecommendations(limit = 10) {
  return useQuery({ queryKey: ["recommendations", limit], queryFn: () => getRecommendations(limit) });
}

export function useFollowUser(followingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => follow(followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", followingId] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: () => alert("Failed to follow user."),
  });
}

export function useUnfollowUser(followingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unfollow(followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", followingId] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: () => alert("Failed to unfollow user."),
  });
}