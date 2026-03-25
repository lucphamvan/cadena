import avatar from "@/assets/avatar.jpg";
import type { User } from "@/types/auth.types";
import { ENV } from "@/config/env";

interface ProfileCardProps {
  readonly user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const photoUrl = user.profile_photo
    ? `${ENV.API_BASE_URL.replace("/api", "")}${user.profile_photo}`
    : avatar;

  return (
    <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="relative mb-6">
        <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl ring-4 ring-surface-container-lowest">
          <img
            alt={`${user.first_name} ${user.last_name} avatar`}
            className="w-full h-full object-cover"
            src={photoUrl}
          />
        </div>
        <div className="absolute bottom-1 right-1 bg-primary-container text-white p-2.5 rounded-full shadow-lg">
          <span className="material-symbols-outlined text-xl leading-none">verified</span>
        </div>
      </div>

      {/* Name & Role */}
      <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-1">
        {user.first_name} {user.last_name}
      </h2>
      <p className="text-primary font-medium mb-6 capitalize">{user.role}</p>

      {/* Info Fields */}
      <div className="w-full space-y-3 pt-6 border-t border-outline-variant/30">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Email</span>
          <span className="font-bold text-right truncate max-w-[200px]">{user.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Member Since</span>
          <span className="font-bold">
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
