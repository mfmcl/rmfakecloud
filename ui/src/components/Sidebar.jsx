import { NavLink, useHistory } from "react-router-dom";
import {
  Blocks,
  FolderOpen,
  House,
  LogOut,
  MonitorPlay,
  Moon,
  NotebookPen,
  ShieldCheck,
  Sun,
  TabletSmartphone,
} from "lucide-react";

import { logout } from "../common/actions";
import { useAuthState } from "../common/useAuthContext";

function NavSection({ label, children }) {
  return (
    <div className="sidebar-section">
      <span className="eyebrow">{label}</span>
      {children}
    </div>
  );
}

export default function Sidebar({ open, onNavigate, theme, onToggleTheme }) {
  const {
    state: { user },
    dispatch,
  } = useAuthState();
  const history = useHistory();

  const isAdmin = user && user.Roles && user.Roles[0] === "Admin";
  const initial = (user?.UserID || "?").charAt(0);

  const linkProps = {
    onClick: onNavigate,
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-mark">
          <NotebookPen />
        </span>
        <div>
          <div className="brand-name">rmfakecloud</div>
          <div className="brand-sub">paper sync</div>
        </div>
      </div>

      <nav className="sidebar-scroll">
        <NavSection label="Library">
          <NavLink exact to="/" className="sidebar-link" activeClassName="active" {...linkProps}>
            <House /> Home
          </NavLink>
          <NavLink to="/documents" className="sidebar-link" activeClassName="active" {...linkProps}>
            <FolderOpen /> Files
          </NavLink>
        </NavSection>

        <NavSection label="Device">
          <NavLink to="/connect" className="sidebar-link" activeClassName="active" {...linkProps}>
            <TabletSmartphone /> Connect
          </NavLink>
          <NavLink to="/screenshare" className="sidebar-link" activeClassName="active" {...linkProps}>
            <MonitorPlay /> Screen Share
          </NavLink>
          <NavLink to="/integrations" className="sidebar-link" activeClassName="active" {...linkProps}>
            <Blocks /> Integrations
          </NavLink>
        </NavSection>

        {isAdmin && (
          <NavSection label="Server">
            <NavLink to="/admin" className="sidebar-link" activeClassName="active" {...linkProps}>
              <ShieldCheck /> Admin
            </NavLink>
          </NavSection>
        )}
      </nav>

      <div className="sidebar-foot">
        <button
          className="user-chip"
          onClick={() => {
            onNavigate?.();
            history.push("/profile");
          }}
          title="Profile"
        >
          <span className="user-avatar">{initial}</span>
          <span className="name">{user?.UserID}</span>
        </button>

        <button
          className="sidebar-logout"
          onClick={() => logout(dispatch)}
          title="Log out"
        >
          <LogOut />
        </button>

        <button
          className="sidebar-logout"
          onClick={onToggleTheme}
          title={theme === "ink" ? "Switch to paper theme" : "Switch to ink theme"}
        >
          {theme === "ink" ? <Sun /> : <Moon />}
        </button>
      </div>
    </aside>
  );
}
