import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useProfile } from "@/features/employee/hooks/useProfile";
import { useUpdateProfile } from "@/features/employee/hooks/useUpdateProfile";
import { useSkills } from "@/features/employee/hooks/useSkills";
import ProfilePhotoUpload from "@/features/employee/components/ProfilePhotoUpload";
import EmploymentIdentity from "@/features/employee/components/EmploymentIdentity";
import ContactInfoForm from "@/features/employee/components/ContactInfoForm";
import SkillsSelector from "@/features/employee/components/SkillsSelector";
import type { UpdateProfileDto } from "@/types/auth.types";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { data: availableSkills, isLoading: skillsLoading } = useSkills();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileDto>();

  // Sync form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
      });
      setSelectedSkills(user.skills ?? []);
    }
  }, [user, reset]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelect = useCallback((file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  }, []);

  const onSubmit = handleSubmit((data) => {
    updateProfile(
      {
        data: { ...data, skills: selectedSkills },
        photo: photoFile ?? undefined,
      },
      {
        onSuccess: () => navigate("/"),
      }
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="text-on-surface-variant font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-error">
            error
          </span>
          <p className="text-on-surface-variant font-medium">
            Failed to load profile. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Edit Employee Profile
        </h1>
        <p className="text-on-surface-variant text-lg">
          Update your professional information and public presence.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column — Photo & Identity */}
        <div className="lg:col-span-4 space-y-10">
          <ProfilePhotoUpload
            currentPhotoUrl={user.profile_photo}
            previewUrl={photoPreview}
            onFileSelect={handlePhotoSelect}
          />
          <EmploymentIdentity user={user} />
        </div>

        {/* Right Column — Editable Fields */}
        <div className="lg:col-span-8 space-y-8">
          <ContactInfoForm register={register} errors={errors} />
          <SkillsSelector
            selectedSkills={selectedSkills}
            availableSkills={availableSkills ?? []}
            onToggle={handleSkillToggle}
            isLoading={skillsLoading}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-6 pt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-8 py-3 text-sm font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-10 py-3 bg-linear-to-br from-primary to-primary-container text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
