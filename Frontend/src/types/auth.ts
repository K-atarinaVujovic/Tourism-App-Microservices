// JWT role: "user" | "admin" — this is the auth-server role.
// The application role (tourist, guide, etc.) lives in the Profile model
// on the Stakeholders service and must be fetched separately when needed.

export type AuthRole = "user" | "admin";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: AuthRole;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_blocked: boolean;
}

//  API request/response shapes

export interface LoginRequest {
  identifier: string; // username or email, backend accepts both
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: "tourist" | "author"
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  user_id: number;
  username: string;
  email: string;
  role: string;
  token: string;
}

// Form data

export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}