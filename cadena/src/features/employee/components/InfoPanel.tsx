import type { User } from "@/types/auth.types";

interface InfoPanelProps {
  readonly user: User;
}

export default function InfoPanel({ user }: InfoPanelProps) {
  return (
    <div className="col-span-12 bg-surface-container-high rounded-xl p-8 flex items-center justify-between">
      <div className="flex gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Role
          </p>
          <p className="font-bold text-lg capitalize">{user.role}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Member Since
          </p>
          <p className="font-bold text-lg">
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Last Updated
          </p>
          <p className="font-bold text-lg">
            {new Date(user.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="hidden md:block">
        {/* <span className="text-sm font-medium text-on-surface-variant italic">
          Profile data from server.
        </span> */}
      </div>
    </div>
  );
}
