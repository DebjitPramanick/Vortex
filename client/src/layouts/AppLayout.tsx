import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@components/molecules/sidebar";
import { useAuthStore } from "@store/useAuthStore";

export function AppLayout() {
  const { user, ready, hydrate, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center text-[13px] text-vortex-secondary">
        Loading workspace…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-svh overflow-hidden bg-vortex-bg">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-vortex-fg/30 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:static md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          email={user.email}
          onSignOut={() => {
            void signOut();
          }}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-vortex-border bg-vortex-surface px-4 md:hidden">
          <button
            type="button"
            className="vx-nav-item w-auto"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden py-4 px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
