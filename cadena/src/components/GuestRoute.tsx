import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
