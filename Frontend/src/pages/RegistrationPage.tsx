import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { RegistrationForm } from "@/features/auth/components/RegistrationForm";
import { registerUser } from "@/features/auth/services/authService";
import type { RegisterFormData } from "@/features/auth/components/RegistrationForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ username, email, password, role }: RegisterFormData) =>
        registerUser({ username, email, password, role }),
    onSuccess: () => navigate("/home"),
    onError: (error: Error) => setErrorMsg(error.message),
  });

  const handleSubmit = (data: RegisterFormData) => {
    setErrorMsg(null);
    mutate(data);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary my-8">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Create an account</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Fill in the details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm onSubmit={handleSubmit} isLoading={isPending} />

          {errorMsg && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}