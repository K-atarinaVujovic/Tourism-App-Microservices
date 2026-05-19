export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const config = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 10000,
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
  },
};
