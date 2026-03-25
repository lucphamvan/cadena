import userAvatar from "@/assets/avatar.jpg";
import { ENV } from "@/config/env";
import { useAuthStore } from "@/stores/useAuthStore";

export default function TopNav() {
  const user = useAuthStore((s) => s.user);
  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between px-6 py-3 w-full mx-auto antialiased tracking-tight">
        <div className="flex items-center gap-8">
          <div className="px-6">
            <h2 className="text-lg font-black text-slate-900">{ENV.APP_NAME}</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* <button className="p-2 text-slate-500 hover:bg-slate-50 transition-colors duration-200 active:scale-95 rounded-lg cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-50 transition-colors duration-200 active:scale-95 rounded-lg cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
          </button> */}
          <div className="w-8 h-8 rounded-full bg-primary overflow-hidden">
            <img alt="User Profile Avatar" className="w-full h-full object-cover" src={userAvatar} />
          </div>
          <span className="text-slate-500">{`${user?.first_name} ${user?.last_name}`}</span>
        </div>
      </div>
      <div className="bg-slate-100 h-px w-full"></div>
    </header>
  );
}
