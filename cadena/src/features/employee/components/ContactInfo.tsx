import type { User } from "@/types/auth.types";

interface ContactInfoProps {
  readonly user: User;
}

export default function ContactInfo({ user }: ContactInfoProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">contact_page</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          Contact Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Email
          </label>
          <p className="text-lg font-medium text-on-surface">
            {user.email}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Phone
          </label>
          <p className="text-lg font-medium text-on-surface">
            {user.phone || "Not set"}
          </p>
        </div>
        <div className="col-span-1 md:col-span-2 space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Address
          </label>
          <p className="text-lg font-medium text-on-surface leading-relaxed">
            {user.address || "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
}
