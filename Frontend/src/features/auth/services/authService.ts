import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";
import type {
    AdminUser,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "@/types/auth";

// Logs the user in and stores the token in the auth store.
export async function loginUser(data: LoginRequest): Promise<void> {
    const response = await apiClient.post<LoginResponse>("/auth/auth/login", data);
    useAuthStore.getState().setAuth(response.data.token);
}

// Registers a new user; the backend returns a token immediately (no email activation).
export async function registerUser(data: RegisterRequest): Promise<void> {
    const response = await apiClient.post<RegisterResponse>("/auth/auth/register", data);
    useAuthStore.getState().setAuth(response.data.token);
}

export function logoutUser(): void {
    useAuthStore.getState().clearAuth();
}

export async function getUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<AdminUser[]>(`/auth/admin/users`);
  return response.data;
}

export async function blockUser(userId: number): Promise<void> {
  await apiClient.post(`/auth/admin/users/block`, { user_id: userId });
}

export async function unblockUser(userId: number): Promise<void> {
  await apiClient.post(`/auth/admin/users/unblock`, { user_id: userId });
}