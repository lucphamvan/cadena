import { NavLink } from "react-router";

export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly href: string;
}

export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { label: "Profile", icon: "person", href: "/" },
  { label: "Edit Profile", icon: "edit", href: "/edit-profile" },
  { label: "Change History", icon: "history", href: "/history" },
] as const;

export const BOTTOM_NAV_ITEMS: readonly NavItem[] = [
  // { label: "Settings", icon: "settings", href: "/settings" },
] as const;

interface SidebarNavLinkProps {
  readonly item: NavItem;
}

export function SidebarNavLink({ item }: SidebarNavLinkProps) {
  const baseClasses =
    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out";

  return (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      className={({ isActive }) =>
        `${baseClasses} ${isActive
          ? "text-blue-700 border-l-4 border-blue-700 bg-blue-50/50"
          : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      <span className="material-symbols-outlined">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}
