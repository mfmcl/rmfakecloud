import { useState } from "react";

import apiservice from "../../services/api.service";
import { useAuthState } from "../../common/useAuthContext";
import PasswordField from "./PasswordField";
import { logout } from "../../common/actions";
import Alert from "../../components/ui/Alert";

export default function ResetPassword() {
  const {
    state: { user },
    dispatch,
  } = useAuthState();
  const userId = user.UserID;

  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    userid: userId,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  function handleChange({ target }) {
    setForm({ ...form, [target.name]: target.value });
  }

  function formIsValid() {
    const errors = {};
    if (!form.currentPassword) errors.currentPassword = "Current password is required";
    if (!form.newPassword) errors.newPassword = "New password is required";
    if (!form.confirmNewPassword)
      errors.confirmNewPassword = "Please confirm your new password";
    else if (form.confirmNewPassword !== form.newPassword)
      errors.confirmNewPassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formIsValid()) return;

    apiservice
      .resetPassword(form)
      .then((r) => {
        if (r.ok) {
          logout(dispatch);
          return;
        }
        if (r.status === 400) return r.json();
        throw new Error("unknown error: " + r.status);
      })
      .then((j) => {
        if (j && j.error) setFormErrors(j);
        else if (j) setFormErrors({ error: "invalid data" });
      })
      .catch((e) => {
        setFormErrors({ error: e.toString() });
      });
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      {formErrors.error && (
        <Alert kind="error" title="Couldn't update password" className="mb-4">
          {formErrors.error}
        </Alert>
      )}

      <div className="field">
        <label htmlFor="currentPassword">Current password</label>
        <input
          className="input"
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="Current password"
          value={form.currentPassword}
          onChange={handleChange}
          autoComplete="off"
        />
        {formErrors.currentPassword && (
          <span className="error-text">{formErrors.currentPassword}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="newPassword">New password</label>
        <PasswordField
          id="newPassword"
          name="newPassword"
          placeholder="New password"
          value={form.newPassword}
          onChange={handleChange}
        />
        {formErrors.newPassword && (
          <span className="error-text">{formErrors.newPassword}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="confirmNewPassword">Confirm new password</label>
        <PasswordField
          id="confirmNewPassword"
          name="confirmNewPassword"
          placeholder="Confirm new password"
          value={form.confirmNewPassword}
          onChange={handleChange}
        />
        {formErrors.confirmNewPassword && (
          <span className="error-text">{formErrors.confirmNewPassword}</span>
        )}
      </div>

      <button className="btn btn-primary" type="submit">
        Update password
      </button>
    </form>
  );
}
