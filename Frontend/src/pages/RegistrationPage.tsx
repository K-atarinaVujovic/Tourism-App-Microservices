// src/pages/RegistrationPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { RegistrationForm } from "@/features/auth/components/RegistrationForm";
import { registerUser } from "@/features/auth/services/authService";
import type { RegisterFormData } from "@/features/auth/components/RegistrationForm";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ username, email, password }: RegisterFormData) =>
        registerUser({ username, email, password }),
    onSuccess: () => navigate("/dashboard"),
    onError: (error: Error) => setErrorMsg(error.message),
  });

  const handleSubmit = (data: RegisterFormData) => {
    setErrorMsg(null);
    mutate(data);
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to get started
            </p>
          </div>

          {/* Form */}
          <RegistrationForm onSubmit={handleSubmit} isLoading={isPending} />

          {/* Server-side error (duplicate username/email, etc.) */}
          {errorMsg && (
              <p className="mt-4 text-sm text-destructive">{errorMsg}</p>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
                to="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
  );
}