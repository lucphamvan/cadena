import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import AuthLayout from "@/features/auth/components/AuthLayout";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import type { RegisterDto } from "@/types/auth.types";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDto>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterDto> = async (data) => {
    try {
      setApiError("");
      const tokens = await authService.register(data);
      setTokens(tokens.access_token, tokens.refresh_token);

      const user = await authService.getProfile();
      setUser(user);

      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setApiError(message);
    }
  };

  return (
    <AuthLayout>
      <main className="grow flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
        {/* Background Architectural Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-tertiary/5 rounded-full blur-[100px]" />

        <div className="w-full max-w-5xl h-full max-h-[720px] grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-xl shadow-[0px_12px_32px_rgba(25,28,29,0.06)] bg-surface-container-low border border-outline-variant/15">
          {/* Branding / Visual Side */}
          <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 bg-primary overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                alt="Modern minimalist office interior"
                className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbFvSN49Al3JeLpA92vOgU64cf_mSqSWzezuXG17hfvGZ6TWGy_19U8VZ_BoWWDLccEi63QvICDAjmiAs2xckpuXDplPDzSR9tqgTOSp9vLMaogvTPYs-YZz1FbSZLUp3nk6smObgclQ2GmnUFljlDzZOp-NtK78rA6QiDliemm3F_mKHW2HBhqA4HuulbNjJ5s8298zKKQ3hp5PxwtI4vkTuOT6gyMleDRHz_lu1Pjtrm1JcXGFbCohNs7DNCWpQ-xP9Lh2JA2Sw"
              />
              <div className="absolute inset-0 bg-linear-to-br from-primary to-primary-container opacity-90" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-on-primary text-3xl">hub</span>
                <span className="text-xl font-bold tracking-tighter text-on-primary">Employee Portal</span>
              </div>
              <h1 className="text-3xl font-extrabold text-on-primary tracking-tight leading-tight mb-4">
                The Architectural Standard for Modern Work.
              </h1>
              <p className="text-primary-fixed text-base leading-relaxed opacity-90">
                Join the central intelligence hub for Nexus Corporate Systems. Secure, integrated, and designed for
                precision.
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-md border border-white/10">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-tertiary-fixed text-lg">verified</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-primary">Enterprise Security</p>
                  <p className="text-[10px] text-primary-fixed/80">SSO &amp; Multi-factor active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 md:p-12 flex flex-col justify-center overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-1">Create Account</h2>
                <p className="text-sm text-on-surface-variant">Initialize your workspace within the Employee Portal.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {apiError && (
                  <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                    {apiError}
                  </div>
                )}
                {/* Full Name Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-on-surface-variant ml-0.5" htmlFor="first_name">
                      First Name
                    </label>
                    <input
                      {...register("first_name", {
                        required: "First name is required",
                        maxLength: {
                          value: 100,
                          message: "Max 100 characters",
                        },
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm text-on-surface placeholder-outline"
                      id="first_name"
                      placeholder="Jane"
                      type="text"
                    />
                    {errors.first_name && <p className="text-xs text-error ml-0.5">{errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-on-surface-variant ml-0.5" htmlFor="last_name">
                      Last Name
                    </label>
                    <input
                      {...register("last_name", {
                        required: "Last name is required",
                        maxLength: {
                          value: 100,
                          message: "Max 100 characters",
                        },
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm text-on-surface placeholder-outline"
                      id="last_name"
                      placeholder="Doe"
                      type="text"
                    />
                    {errors.last_name && <p className="text-xs text-error ml-0.5">{errors.last_name.message}</p>}
                  </div>
                </div>

                {/* Corporate Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-on-surface-variant ml-0.5" htmlFor="reg-email">
                    Corporate Email
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-lg">
                      alternate_email
                    </span>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full pl-10 pr-3 py-2 rounded-lg bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm text-on-surface placeholder-outline"
                      id="reg-email"
                      placeholder="jane.doe@nexus-corp.com"
                      type="email"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-error ml-0.5">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-on-surface-variant ml-0.5" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-lg">
                      lock
                    </span>
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      className="w-full pl-10 pr-10 py-2 rounded-lg bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm text-on-surface placeholder-outline"
                      id="reg-password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-error ml-0.5">{errors.password.message}</p>
                  ) : (
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5 px-0.5">Min. 8 characters.</p>
                  )}
                </div>

                {/* Action */}
                <div className="pt-2 space-y-4">
                  <button
                    className="w-full py-3 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md shadow-primary/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Sign Up"}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>

                  <div className="relative flex items-center py-1">
                    <div className="grow border-t border-outline-variant/30" />
                    <span className="shrink mx-3 text-[10px] font-semibold text-outline tracking-widest uppercase">
                      Or
                    </span>
                    <div className="grow border-t border-outline-variant/30" />
                  </div>

                  <p className="text-center text-on-surface-variant text-xs">
                    Already part of the network?{" "}
                    <Link className="text-primary font-bold hover:underline ml-1 transition-all" to="/login">
                      Log in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
