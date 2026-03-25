import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const EmployeeProfilePage = lazy(() => import("@/pages/EmployeeProfilePage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const ChangeHistoryPage = lazy(() => import("@/pages/ChangeHistoryPage"));

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <EmployeeProfilePage /> },
          { path: "/edit-profile", element: <EditProfilePage /> },
          { path: "/history", element: <ChangeHistoryPage /> },
        ],
      },
    ],
  },
]);

export default router;
