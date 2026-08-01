import { useState } from "react";
import { useHistory } from "react-router-dom";
import { NotebookPen } from "lucide-react";

import { useAuthState } from "../../common/useAuthContext";
import { loginUser } from "../../common/actions";
import Alert from "../../components/ui/Alert";

const Login = () => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch } = useAuthState();
  const { errorMessage, loading } = state;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(dispatch, { email: username, password });
      history.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-brand">
        <span className="brand-mark">
          <NotebookPen />
        </span>
        <div>
          <h1>rmfakecloud</h1>
          <div className="sub">Your own paper cloud</div>
        </div>
      </div>

      <div className="card card-pad auth-card">
        <form onSubmit={handleLogin}>
          {errorMessage && (
            <Alert kind="error" className="mb-3" title="Sign in failed">
              {errorMessage}
            </Alert>
          )}

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              className="input"
              id="username"
              value={username}
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Username"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
