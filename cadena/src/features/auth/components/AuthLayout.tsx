import type { ReactNode } from "react";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-surface font-sans text-on-surface antialiased h-screen overflow-hidden flex flex-col">
      {children}

      {/* Compact Footer */}
      <footer className="bg-surface-container-low w-full border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center px-8 py-4 shrink-0">
        <div className="flex flex-col md:flex-row items-center gap-3 mb-2 md:mb-0">
          <span className="font-bold text-sm text-on-surface">Employee Portal</span>
          <span className="text-[11px] text-on-surface-variant opacity-70">© 2024 Nexus Corporate Systems.</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4">
          <a
            className="text-[11px] text-on-surface-variant hover:text-primary transition-all duration-200 opacity-80 hover:opacity-100"
            href="#"
          >
            Privacy
          </a>
          <a
            className="text-[11px] text-on-surface-variant hover:text-primary transition-all duration-200 opacity-80 hover:opacity-100"
            href="#"
          >
            Terms
          </a>
          <a
            className="text-[11px] text-on-surface-variant hover:text-primary transition-all duration-200 opacity-80 hover:opacity-100"
            href="#"
          >
            Security
          </a>
          <a
            className="text-[11px] text-on-surface-variant hover:text-primary transition-all duration-200 opacity-80 hover:opacity-100"
            href="#"
          >
            Support
          </a>
        </nav>
      </footer>
    </div>
  );
}
