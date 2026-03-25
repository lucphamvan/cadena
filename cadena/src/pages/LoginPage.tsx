import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import AuthLayout from "@/features/auth/components/AuthLayout";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LoginDto } from "@/types/auth.types";

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginDto> = async (data) => {
    try {
      setApiError("");
      const tokens = await authService.login(data);
      setTokens(tokens.access_token, tokens.refresh_token);

      const user = await authService.getProfile();
      setUser(user);

      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      setApiError(message);
    }
  };

  return (
    <AuthLayout>
      <main className="grow flex items-center justify-center p-4 architectural-bg">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          {/* Branding Anchor */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-primary-container/10 mb-2">
              <span className="material-symbols-outlined text-primary text-3xl">domain</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface leading-tight">Employee Portal</h1>
          </div>

          {/* Login Card */}
          <div className="glass-panel rounded-xl p-8 shadow-2xl border border-outline-variant/20 w-full mb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                  {apiError}
                </div>
              )}
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant ml-1" htmlFor="login-email">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">
                      alternate_email
                    </span>
                  </div>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="block w-full pl-11 pr-4 py-3 bg-surface-container-highest border-none rounded-md focus:ring-0 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 text-sm text-on-surface border-2 border-transparent focus:border-primary/20"
                    id="login-email"
                    placeholder="you@company.com"
                    type="email"
                  />
                </div>
                {errors.email && <p className="text-xs text-error ml-1">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="login-password">
                    Password
                  </label>
                  <a
                    className="text-[10px] font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-wider"
                    href="#"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">
                      lock
                    </span>
                  </div>
                  <input
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="block w-full pl-11 pr-4 py-3 bg-surface-container-highest border-none rounded-md focus:ring-0 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 text-sm text-on-surface border-2 border-transparent focus:border-primary/20"
                    id="login-password"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
                {errors.password && <p className="text-xs text-error ml-1">{errors.password.message}</p>}
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  className="w-full py-3.5 bg-linear-to-br from-primary to-primary-container text-white font-bold rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>

            {/* Footer Link */}
            <div className="mt-6 pt-5 border-t border-outline-variant/10 text-center">
              <p className="text-on-surface-variant text-xs">
                New to the network?{" "}
                <Link className="ml-1 font-bold text-primary hover:underline transition-all" to="/register">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Global Support */}
          <div className="flex justify-center gap-4 text-[10px] font-semibold text-on-surface-variant/60 tracking-widest uppercase">
            <a className="hover:text-primary transition-colors" href="#">
              Support
            </a>
            <span className="text-outline-variant">|</span>
            <a className="hover:text-primary transition-colors" href="#">
              Security
            </a>
            <span className="text-outline-variant">|</span>
            <a className="hover:text-primary transition-colors" href="#">
              Privacy
            </a>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
