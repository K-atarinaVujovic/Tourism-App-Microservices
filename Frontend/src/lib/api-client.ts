import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to every request
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Normalise errors: surface the backend's { error: string } message,
// and clear auth state when the server says the token is no longer valid.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
        }
        const message: string =
            error.response?.data?.error ?? "Something went wrong. Please try again.";
        return Promise.reject(new Error(message));
    }
);

export default apiClient;