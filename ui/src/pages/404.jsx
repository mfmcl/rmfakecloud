import { useHistory } from "react-router-dom";
import { House } from "lucide-react";

const NoMatch = () => {
  const history = useHistory();
  return (
    <div className="notfound">
      <div className="code">404</div>
      <p className="muted serif" style={{ fontSize: "var(--text-lg)" }}>
        This page seems to have slipped between the sheets.
      </p>
      <button className="btn btn-outline" onClick={() => history.push("/")}>
        <House /> Back home
      </button>
    </div>
  );
};

export default NoMatch;
