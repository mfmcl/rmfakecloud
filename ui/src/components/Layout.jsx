import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, NotebookPen } from "lucide-react";

import { useAuthState } from "../common/useAuthContext";
import { useTheme } from "../common/useTheme";
import Sidebar from "./Sidebar";
import PasscodeResets from "./PasscodeResets";

export default function Layout({ children }) {
  const {
    state: { user },
  } = useAuthState();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!user) {
    return <div className="app">{children}</div>;
  }

  return (
    <div className="app">
      <Sidebar
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div
        className={`sidebar-backdrop ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <div className="app-main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
          <span style={{ width: 34 }} />
        </header>

        <div className="content">
          <PasscodeResets />
          <div key={location.pathname} className="page-stage">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
