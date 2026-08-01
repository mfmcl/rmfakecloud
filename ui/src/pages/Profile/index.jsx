import { useAuthState } from "../../common/useAuthContext";
import ResetPassword from "./ResetPassword";

const Profile = () => {
  const {
    state: { user },
  } = useAuthState();

  return (
    <div className="page page-narrow">
      <div className="page-inner">
        <header className="page-head">
          <h1>Profile</h1>
          <p className="lede">
            Signed in as <strong>{user.UserID}</strong>
            {user.scopes === "sync15" && (
              <>
                {" "}
                <span className="badge">sync 1.5</span>
              </>
            )}
          </p>
        </header>

        <div className="card card-pad">
          <h3 style={{ marginBottom: "var(--sp-4)", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-base)" }}>
            Change password
          </h3>
          <ResetPassword />
        </div>
      </div>
    </div>
  );
};

export default Profile;
