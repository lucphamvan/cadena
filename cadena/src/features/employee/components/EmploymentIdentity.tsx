import type { User } from "@/types/auth.types";

interface EmploymentIdentityProps {
  readonly user: User;
}

export default function EmploymentIdentity({ user }: EmploymentIdentityProps) {
  return (
    <section className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
      <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">
        Employment Identity
      </h3>
      <div className="space-y-6">
        <div className="flex item-center gap-4 justify-between">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              First Name
            </label>
            <p className="text-sm font-semibold text-on-surface/60">
              {user.first_name}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Last Name
            </label>
            <p className="text-sm font-semibold text-on-surface/60">
              {user.last_name}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">
            Full Name
          </label>
          <p className="text-sm font-semibold text-on-surface/60">
            {user.first_name} {user.last_name}
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">
            Employee ID
          </label>
          <p className="text-sm font-mono text-on-surface/60">
            {user.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>
    </section>
  );
}
