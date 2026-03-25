import { Suspense } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Outlet />
    </Suspense>
  );
}
