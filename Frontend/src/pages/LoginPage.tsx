// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { loginUser } from "@/features/auth/services/authService";
import type { LoginFormData } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => navigate("/home"),
    onError: (error: Error) => setErrorMsg(error.message),
  });

  const handleSubmit = (data: LoginFormData) => {
    setErrorMsg(null);
    mutate(data);
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <LoginForm onSubmit={handleSubmit} isLoading={isPending} />

          {/* Server-side error (blocked account, wrong credentials, etc.) */}
          {errorMsg && (
              <p className="mt-4 text-sm text-destructive">{errorMsg}</p>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
                to="/register"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
  );
}