import { useNavigate } from "react-router";
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS, SidebarNavLink } from "@/constants/navigation.tsx";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services/auth.service";

export default function Sidebar() {
  const navigate = useNavigate();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Logout API failed — still clear local state
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-200 flex flex-col pt-20 pb-6 z-40">
      <nav className="flex-1 space-y-1">
        {MAIN_NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.label} item={item} />
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-4 space-y-1">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.label} item={item} />
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 w-full cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
