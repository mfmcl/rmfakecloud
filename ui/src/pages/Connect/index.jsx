import { useLayoutEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import apiservice from "../../services/api.service";
import Alert from "../../components/ui/Alert";

export default function Connect() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const newCode = async () => {
    setBusy(true);
    setCode("");
    setError("");
    try {
      const code = await apiservice.getCode();
      setCode(code);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  useLayoutEffect(() => {
    newCode();
  }, []);

  const chars = (code || "").split("");

  return (
    <div className="connect-wrap">
      <div className="connect-card">
        <div>
          <span className="eyebrow">Pair a device</span>
          <h1 style={{ margin: "var(--sp-2) 0" }}>Connect your reMarkable</h1>
          <p className="muted serif" style={{ fontSize: "var(--text-lg)", margin: 0 }}>
            Enter this one-time code on your tablet to link it with your cloud.
          </p>
        </div>

        {error ? (
          <Alert kind="error" title="Couldn't get a code">
            {error.message || error.toString()}
          </Alert>
        ) : (
          <div className="code-tiles" aria-live="polite">
            {chars.length === 0 && (
              <span className="spinner" style={{ margin: "var(--sp-4)" }} />
            )}
            {chars.map((c, i) => (
              <span key={i} className="code-tile">
                {c}
              </span>
            ))}
          </div>
        )}

        <button className="btn btn-outline" onClick={newCode} disabled={busy}>
          {busy ? <span className="spinner sm" /> : <RefreshCw />}
          Generate a new code
        </button>
      </div>
    </div>
  );
}
