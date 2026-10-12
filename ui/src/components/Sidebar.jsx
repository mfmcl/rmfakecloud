import { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import {
  Blocks,
  BookOpen,
  Code2,
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
import apiService from "../services/api.service";

function NavSection({ label, children }) {
  return (
    <div className="sidebar-section">
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
  const [version, setVersion] = useState(null);

  useEffect(() => {
    let active = true;
    apiService.getVersion().then((data) => {
      if (active && data?.version) setVersion(data.version);
    });
    return () => {
      active = false;
    };
  }, []);

  const isAdmin = user && user.Roles && user.Roles[0] === "Admin";
  const initial = (user?.UserID || "?").charAt(0);

  const linkProps = {
    onClick: onNavigate,
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div>
          <div className="brand-name">reMarkable</div>
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


      <NavSection label="Links">
        <a
          href="https://ddvk.github.io/rmfakecloud/"
          className="sidebar-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          <BookOpen /> Docs
        </a>
        <a
          href="https://github.com/mfmcl/rmfakecloud"
          className="sidebar-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          <Code2 /> GitHub
        </a>
        {version && (
          <div className="sidebar-version" title="Server version">
            rmfakecloud {version}
          </div>
        )}
      </NavSection>

      <div className="sidebar-foot">
        <button
          className="user-chip"
          onClick={() => {
            onNavigate?.();
            history.push("/profile");
          }}
          title="Profile"
        >
          <span className="name">{user?.UserID}</span>
        </button>

        <button
          className="sidebar-logout"
          onClick={onToggleTheme}
          title={theme === "ink" ? "Switch to paper theme" : "Switch to ink theme"}
        >
          {theme === "ink" ? <Sun /> : <Moon />}
        </button>

        <button
          className="sidebar-logout"
          onClick={() => logout(dispatch)}
          title="Log out"
        >
          <LogOut />
        </button>
      </div>
    </aside>
  );
}
