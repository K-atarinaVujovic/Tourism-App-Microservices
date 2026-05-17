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

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<{ imageUrl: string }>(
    `/stakeholders/profiles/upload-image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.imageUrl;
}