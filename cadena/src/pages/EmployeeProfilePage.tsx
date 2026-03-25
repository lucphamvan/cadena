import { useNavigate } from "react-router";
import ProfileCard from "@/features/employee/components/ProfileCard";
import ContactInfo from "@/features/employee/components/ContactInfo";
import CoreCompetencies from "@/features/employee/components/CoreCompetencies";
import InfoPanel from "@/features/employee/components/InfoPanel";
import { useProfile } from "@/features/employee/hooks/useProfile";

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useProfile();

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
    <>
      {/* Header Actions */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-sm font-bold tracking-widest text-tertiary mb-2 uppercase">
            Personnel Records
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Employee Profile
          </h1>
        </div>
        <button
          onClick={() => navigate("/edit-profile")}
          className="bg-linear-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit Profile
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        <ProfileCard user={user} />

        <div className="col-span-12 lg:col-span-8 space-y-8">
          <ContactInfo user={user} />
          <CoreCompetencies skills={user.skills ?? []} />
        </div>

        <InfoPanel user={user} />
      </div>
    </>
  );
}
