import apiClient from "@/lib/api-client";
import type { User } from "@/types/follower";
import type { Blog } from "@/types/blog";

const BASE = "/follower/followers";

export async function follow(followingId: number): Promise<void> {
  await apiClient.post(`${BASE}/follow/${followingId}`);
}

export async function unfollow(followingId: number): Promise<void> {
  await apiClient.delete(`${BASE}/unfollow/${followingId}`);
}

export async function isFollowing(userId2: number): Promise<boolean> {
  const response = await apiClient.get<boolean>(`${BASE}/is-following/${userId2}`);
  return response.data;
}

export async function getFollowers(): Promise<User[]> {
  const response = await apiClient.get<User[]>(`${BASE}/followers-list`);
  return response.data;
}

export async function getFollowing(): Promise<User[]> {
  const response = await apiClient.get<User[]>(`${BASE}/following`);
  return response.data;
}

export async function getFollowerBlogs(): Promise<Blog[]> {
  const response = await apiClient.get<Blog[]>(`${BASE}/all-blogs`);
  return response.data;
}

export async function getRecommendations(limit = 10): Promise<User[]> {
  const response = await apiClient.get<User[]>(`${BASE}/recommendations`, { params: { limit } });
  return response.data;
}