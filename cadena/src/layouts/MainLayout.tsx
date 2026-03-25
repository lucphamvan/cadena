import { Outlet } from "react-router";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";

export default function MainLayout() {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <TopNav />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-10 bg-surface">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
