import { useState } from "react";
import apiService from "../../services/api.service";
import Alert from "../../components/ui/Alert";
import ProviderFields from "./ProviderFields";

export default function IntegrationModal({ integration, onSave, onClose }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: integration?.Name,
    provider: integration?.Provider,
    email: integration?.email,
    username: integration?.Username,
    password: integration?.Password,
    address: integration?.Address,
    activetransfers: integration?.ActiveTransfers,
    insecure: integration?.Insecure,
    accesstoken: integration?.Accesstoken,
    path: integration?.Path,
    endpoint: integration?.Endpoint,
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
      await apiService.updateintegration({
        id: integration.ID,
        name: form.name,
        provider: form.provider,
        username: form.username,
        password: form.password,
        address: form.address,
        activetransfers: form?.activetransfers,
        insecure: form.insecure,
        accesstoken: form.accesstoken,
        path: form.path,
        endpoint: form.endpoint,
      });
      onSave();
    } catch (e) {
      setError(e.toString());
    }
  }

  if (!integration) return null;

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert kind="error" className="mb-4">
          <span style={{ whiteSpace: "pre-wrap" }}>{error}</span>
        </Alert>
      )}

      <div className="field">
        <label>Integration ID</label>
        <input className="input mono" value={integration.ID} disabled />
      </div>

      <div className="field">
        <label htmlFor="im-provider">Provider</label>
        <select
          id="im-provider"
          className="select"
          name="provider"
          value={form.provider}
          onChange={handleChange}
        >
          <option value="localfs">Directory in file system</option>
          <option value="webdav">WebDAV</option>
          <option value="ftp">FTP</option>
          <option value="dropbox">Dropbox</option>
          <option value="webhook">Messaging webhook</option>
          <option value="ics">ICS Calendar</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="im-name">Name</label>
        <input
          id="im-name"
          className="input"
          placeholder="Integration name"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
        />
      </div>

      <ProviderFields form={form} setForm={setForm} />

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
