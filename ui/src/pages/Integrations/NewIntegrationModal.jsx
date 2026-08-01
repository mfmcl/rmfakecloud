import { useState } from "react";
import apiService from "../../services/api.service";
import Alert from "../../components/ui/Alert";
import ProviderFields from "./ProviderFields";

export default function NewIntegrationModal({ onSave, onClose }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    provider: "localfs",
  });

  function handleChange({ target }) {
    setForm({ ...form, [target.name]: target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name) {
      setError("Name is required");
      return;
    }
    try {
      await apiService.createintegration(form);
      onSave();
    } catch (e) {
      setError(e.toString());
    }
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      {error && (
        <Alert kind="error" className="mb-4">
          <span style={{ whiteSpace: "pre-wrap" }}>{error}</span>
        </Alert>
      )}

      <div className="field">
        <label htmlFor="ni-name">Name</label>
        <input
          id="ni-name"
          className="input"
          placeholder="Integration name"
          name="name"
          value={form.name}
          autoFocus
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="ni-provider">Provider</label>
        <select
          id="ni-provider"
          className="select"
          name="provider"
          value={form.provider}
          onChange={handleChange}
        >
          <option value="localfs">Directory in file system</option>
          <option value="ftp">FTP</option>
          <option value="webdav">WebDAV</option>
          <option value="dropbox">Dropbox</option>
          <option value="webhook">Messaging webhook</option>
          <option value="ics">ICS Calendar</option>
        </select>
      </div>

      <ProviderFields form={form} setForm={setForm} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Create integration
        </button>
      </div>
    </form>
  );
}
