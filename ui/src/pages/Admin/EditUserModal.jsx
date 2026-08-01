import { useState } from "react";
import apiService from "../../services/api.service";
import Alert from "../../components/ui/Alert";

export default function EditUserModal({ user, onSave, onClose }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    newPassword: "",
    email: user?.email || "",
  });

  function handleChange({ target }) {
    setForm({ ...form, [target.name]: target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email) {
      setError("Email is required");
      return;
    }
    try {
      await apiService.updateuser({
        userid: user.userid,
        email: form.email,
        newPassword: form.newPassword,
      });
      onSave();
    } catch (e) {
      setError(e.toString());
    }
  }

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert kind="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="field">
        <label>User ID</label>
        <input className="input" value={user.userid} disabled />
      </div>
      <div className="field">
        <label htmlFor="eu-email">Email</label>
        <input
          id="eu-email"
          className="input"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>
      <div className="field">
        <label htmlFor="eu-password">New password</label>
        <input
          id="eu-password"
          className="input"
          type="password"
          placeholder="Leave blank to keep current"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
      </div>
    </form>
  );
}
