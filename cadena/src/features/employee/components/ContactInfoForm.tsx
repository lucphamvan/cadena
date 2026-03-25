import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { UpdateProfileDto } from "@/types/auth.types";

interface ContactInfoFormProps {
  readonly register: UseFormRegister<UpdateProfileDto>;
  readonly errors: FieldErrors<UpdateProfileDto>;
}

const INPUT_CLASSES =
  "w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary/20 rounded-lg p-3 text-on-surface text-sm transition-all focus:bg-surface-container-lowest outline-none";

export default function ContactInfoForm({
  register,
  errors,
}: ContactInfoFormProps) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
      <div className="flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-primary">
          contact_mail
        </span>
        <h2 className="text-xl font-bold tracking-tight">
          Contact Information
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-on-surface"
            htmlFor="phone"
          >
            Mobile Phone
          </label>
          <input
            id="phone"
            type="tel"
            className={INPUT_CLASSES}
            {...register("phone", { maxLength: 20 })}
          />
          {errors.phone && (
            <p className="text-xs text-error mt-1">
              Phone must be 20 characters or less
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-on-surface"
            htmlFor="email"
          >
            Work Email
          </label>
          <input
            id="email"
            type="email"
            className={INPUT_CLASSES}
            {...register("email", {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-error mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="md:col-span-2 space-y-2">
          <label
            className="block text-sm font-semibold text-on-surface"
            htmlFor="address"
          >
            Residential Address
          </label>
          <textarea
            id="address"
            rows={3}
            className={INPUT_CLASSES}
            {...register("address")}
          />
        </div>
      </div>
    </div>
  );
}
