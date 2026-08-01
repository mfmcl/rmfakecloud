import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import apiservice from "../services/api.service";
import { useAuthState } from "../common/useAuthContext";

export default function PasscodeResets() {
  const {
    state: { user },
  } = useAuthState();
  const [resets, setResets] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    apiservice
      .listPasscodeResets()
      .then((list) => setResets(Array.isArray(list) ? list : []))
      .catch((e) => setError(e.toString()));
  };

  useEffect(() => {
    if (!user) {
      setResets([]);
      return;
    }
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const approve = (uuid) => {
    apiservice
      .approvePasscodeReset(uuid)
      .then(load)
      .catch((e) => setError(e.toString()));
  };

  const dismiss = (uuid) => {
    apiservice
      .dismissPasscodeReset(uuid)
      .then(load)
      .catch((e) => setError(e.toString()));
  };

  if (!user) return null;
  if (error) {
    return (
      <div className="passcode-list">
        <div className="alert alert-error">
          <KeyRound />
          <div>{error}</div>
        </div>
      </div>
    );
  }
  if (resets.length === 0) return null;

  return (
    <div className="passcode-list">
      {resets.map((r) => (
        <div className="passcode-item" key={r.RequestID}>
          <div>
            <div>
              <strong>Passcode reset requested</strong> — {r.DeviceName || "device"}
            </div>
            <div className="faint mono" style={{ fontSize: "var(--text-xs)" }}>
              {r.DeviceID} · {new Date(r.Created).toLocaleString()}
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-outline btn-sm" onClick={() => dismiss(r.RequestID)}>
              Dismiss
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => approve(r.RequestID)}>
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
