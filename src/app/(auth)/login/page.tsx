"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Lock, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
type LoginForm = z.infer<typeof schema>;

/**
 * Login Owner & Kasir (PRD / FEATURE_MATRIX). Pelanggan tidak login.
 * Setelah berhasil, redirect berdasarkan peran: owner -> /owner, cashier -> /pos.
 */
export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
    setError(null);
    const res = await signIn(values.email, values.password);
    if (!res.ok) {
      setError(res.error ?? "Login gagal.");
      setSubmitting(false);
      return;
    }
    setUser({
      id: values.email,
      name: res.name ?? "",
      email: values.email,
      role: res.role!,
    });
    const next =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
    const dest = next ?? (res.role === "owner" ? "/owner" : "/pos");
    router.replace(dest);
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary">Majamu</h1>
          <p className="text-sm text-black/55">Masuk untuk Owner & Kasir</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-modal bg-surface p-6 shadow-sm ring-1 ring-black/5"
        >
          {error && (
            <div className="rounded-card bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Email
            </label>
            <div
              className={cn(
                "flex items-center gap-2 rounded-card border px-3",
                errors.email ? "border-error" : "border-black/15"
              )}
            >
              <Mail className="h-4 w-4 text-black/40" />
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="owner@majamu.local"
                className="h-11 w-full bg-transparent text-base outline-none"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Password
            </label>
            <div
              className={cn(
                "flex items-center gap-2 rounded-card border px-3",
                errors.password ? "border-error" : "border-black/15"
              )}
            >
              <Lock className="h-4 w-4 text-black/40" />
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 w-full bg-transparent text-base outline-none"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button block size="lg" type="submit" disabled={submitting}>
            {submitting ? "Memproses…" : "Masuk"}
          </Button>

          <p className="text-center text-xs text-black/45">
            Pelanggan tidak perlu login — cukup scan QR di meja.
          </p>
        </form>
      </div>
    </div>
  );
}
