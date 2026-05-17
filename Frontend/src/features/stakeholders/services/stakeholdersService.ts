import apiClient from "@/lib/api-client";
import type { Profile, UpdateProfile } from "@/types/stakeholders";

export async function getProfile(userId: number): Promise<Profile> {
  const response = await apiClient.get<Profile>(`/stakeholders/profiles/${userId}`);
  return response.data;
}

export async function updateProfile(data: UpdateProfile): Promise<void> {
  console.log(data);
  await apiClient.put(`/stakeholders/profiles/update`, data);
}