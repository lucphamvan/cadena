import type { User, UserActivity } from "@/types/auth.types";
import { ENV } from "@/config/env";

interface HistoryDetailPanelProps {
  readonly activity: UserActivity;
  readonly user: User;
  readonly onClose: () => void;
}

const FIELD_ICONS: Record<string, string> = {
  profile_photo: "photo_camera",
  email: "mail",
  address: "location_on",
  phone: "call",
  skills: "psychology",
};

export default function HistoryDetailPanel({
  activity,
  user,
  onClose,
}: HistoryDetailPanelProps) {
  const getDeviceIcon = (device: string) => {
    const l = device.toLowerCase();
    if (l.includes("mac") || l.includes("windows")) return "laptop_mac";
    if (l.includes("iphone") || l.includes("android")) return "smartphone";
    return "devices";
  };

  const renderChangeValue = (field: string, value: string, isNew: boolean) => {
    if (field === "profile_photo") {
      return (
        <div
          className={`h-20 rounded-lg overflow-hidden flex items-center justify-center ${isNew
            ? "bg-primary-fixed border-2 border-primary"
            : "bg-surface-container-low border border-dashed border-outline-variant"
            }`}
        >
          {value ? (
            <img
              alt="Photo"
              className="w-full h-full object-cover"
              src={`${ENV.API_BASE_URL.replace("/api", "")}${value}`}
            />
          ) : (
            <span className="material-symbols-outlined text-outline">
              image_not_supported
            </span>
          )}
        </div>
      );
    }

    if (field === "skills") {
      let skillsArray: string[] = [];
      try {
        skillsArray = JSON.parse(value);
      } catch {
        skillsArray = [value];
      }
      return (
        <div
          className={`p-3 rounded-lg text-xs flex flex-wrap gap-1 ${isNew
            ? "bg-primary/5 text-primary border border-primary/20 font-semibold"
            : "bg-surface-container-high text-on-surface-variant line-through opacity-60"
            }`}
        >
          {skillsArray.map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-surface-container-highest">
              {s}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div
        className={`p-3 rounded-lg text-xs ${isNew
          ? "bg-primary/5 font-semibold text-primary border border-primary/20"
          : "bg-surface-container-high text-on-surface-variant line-through opacity-60"
          }`}
      >
        {value || <span className="italic opacity-50">Empty</span>}
      </div>
    );
  };

  return (
    <aside className="w-[35%] bg-surface-container-lowest border-l border-outline-variant/10 hidden lg:flex flex-col shadow-[0px_0px_64px_0px_rgba(25,28,29,0.04)] z-10">
      <div className="p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-start mb-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
              Selected Record
            </span>
            <h3 className="text-2xl font-bold text-on-surface mt-1">
              {user.first_name} {user.last_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-10 flex-1">
          {/* Summary Section */}
          <div className="bg-surface p-6 rounded-xl space-y-4">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">
                Activity ID
              </span>
              <span className="text-xs font-mono text-on-surface truncate ml-4">
                {activity.id.split("-")[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">
                Device
              </span>
              <span className="text-xs text-on-surface flex items-center gap-1 max-w-[150px] truncate" title={activity.device || ""}>
                <span className="material-symbols-outlined text-sm">
                  {getDeviceIcon(activity.device || "")}
                </span>
                {(activity.device || "").split("/")[0] || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">
                IP Address
              </span>
              <span className="text-xs text-on-surface">
                {activity.ip_address}
              </span>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">
              Field Comparison
            </h4>

            {activity.changes.map((change, idx) => (
              <div key={`${change.field}-${idx}`} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">
                    {FIELD_ICONS[change.field] || "edit"}
                  </span>
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    {change.field}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {change.field === "profile_photo" && (
                      <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase w-full truncate">
                        Old Value
                      </p>
                    )}
                    {renderChangeValue(change.field, change.old_value, false)}
                  </div>
                  <div className="space-y-2">
                    {change.field === "profile_photo" && (
                      <p className="text-[10px] font-bold text-primary uppercase w-full truncate">
                        New Value
                      </p>
                    )}
                    {renderChangeValue(change.field, change.new_value, true)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </aside>
  );
}
