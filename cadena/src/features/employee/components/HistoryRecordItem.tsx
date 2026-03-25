import type { User, UserActivity } from "@/types/auth.types";
import { ENV } from "@/config/env";
import avatarImg from "@/assets/avatar.jpg";

interface HistoryRecordItemProps {
  readonly activity: UserActivity;
  readonly user: User;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

const FIELD_ICONS: Record<string, string> = {
  profile_photo: "photo_camera",
  email: "mail",
  address: "location_on",
  phone: "call",
  skills: "psychology",
};

export default function HistoryRecordItem({
  activity,
  user,
  isSelected,
  onClick,
}: HistoryRecordItemProps) {
  const date = new Date(activity.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const photoUrl = user.profile_photo
    ? `${ENV.API_BASE_URL.replace("/api", "")}${user.profile_photo}`
    : avatarImg;

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer group hover:translate-x-1 ${
        isSelected
          ? "bg-surface-container-lowest border-primary shadow-md ring-1 ring-primary"
          : "bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/50 hover:shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
            <img
              alt={user.first_name}
              className="w-full h-full object-cover"
              src={photoUrl}
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">
              {user.first_name} {user.last_name}{" "}
              <span className="text-on-surface-variant font-normal italic">
                {activity.action}
              </span>
            </h4>
            <p className="text-xs text-on-surface-variant">
              {formattedDate} • {formattedTime}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {activity.changes.map((change, idx) => {
          const icon = FIELD_ICONS[change.field] || "edit";
          return (
            <span
              key={`${change.field}-${idx}`}
              className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant text-[11px] font-semibold rounded-md flex items-center gap-1.5 capitalize"
            >
              <span className="material-symbols-outlined text-[14px]">
                {icon}
              </span>
              {change.field}
            </span>
          );
        })}
      </div>
    </div>
  );
}
