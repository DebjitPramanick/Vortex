import { NavLink } from "react-router-dom";
import { Button } from "../../atoms/button";
import "./sidebar.css";

export type SidebarProps = {
  email?: string | null;
  onSignOut?: () => void;
};

export function Sidebar({ email, onSignOut }: SidebarProps) {
  return (
    <aside className="vx-sidebar">
      <NavLink to="/applications" className="vx-sidebar-brand">
        <span className="vx-sidebar-mark">Vx</span>
        <span>
          <span className="block text-[13px] font-semibold tracking-tight">
            Vortex
          </span>
          <span className="vx-meta leading-none">Job command center</span>
        </span>
      </NavLink>

      <nav className="vx-sidebar-nav" aria-label="Primary">
        <NavLink to="/applications" className="vx-nav-item vx-sidebar-link">
          Applications
        </NavLink>
        <NavLink to="/dashboard" className="vx-nav-item vx-sidebar-link">
          Dashboard
        </NavLink>
      </nav>

      <div className="vx-sidebar-footer">
        <div className="vx-sidebar-user">
          <p className="vx-sidebar-email" title={email ?? undefined}>
            {email ?? "Signed in"}
          </p>
          {onSignOut ? (
            <Button type="button" size="sm" variant="ghost" onClick={onSignOut}>
              Sign out
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
