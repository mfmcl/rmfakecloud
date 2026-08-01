// Shared provider-specific fields for integration create/edit forms.
export default function ProviderFields({ form, setForm }) {
  const handleChange = ({ target }) => {
    setForm({ ...form, [target.name]: target.value });
  };
  const handleCheck = ({ target }) => {
    setForm({ ...form, [target.name]: target.checked });
  };

  const provider = form.provider;

  return (
    <>
      {(provider === "webdav" || provider === "ftp") && (
        <>
          <div className="field">
            <label>Address</label>
            <input
              className="input"
              placeholder="Server URL"
              name="address"
              value={form.address || ""}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Username</label>
            <input
              className="input"
              placeholder="Username"
              name="username"
              value={form.username || ""}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="Password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      {provider === "ftp" && (
        <div className="field">
          <label className="checkbox">
            <input
              type="checkbox"
              name="activetransfers"
              checked={!!form.activetransfers}
              onChange={handleCheck}
            />
            Use active transfers
          </label>
        </div>
      )}

      {provider === "ics" && (
        <>
          <div className="field">
            <label>ICS URL</label>
            <input
              className="input"
              placeholder="https://example.com/calendar.ics"
              name="address"
              value={form.address || ""}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label className="checkbox">
              <input
                type="checkbox"
                name="insecure"
                checked={!!form.insecure}
                onChange={handleCheck}
              />
              Ignore TLS certificate errors
            </label>
          </div>
        </>
      )}

      {provider === "localfs" && (
        <div className="field">
          <label>Path</label>
          <input
            className="input"
            placeholder="/path/to/folder"
            name="path"
            value={form.path || ""}
            onChange={handleChange}
          />
        </div>
      )}

      {provider === "dropbox" && (
        <div className="field">
          <label>Access token</label>
          <input
            className="input"
            placeholder="Access token"
            name="accesstoken"
            value={form.accesstoken || ""}
            onChange={handleChange}
          />
        </div>
      )}

      {provider === "webhook" && (
        <div className="field">
          <label>Endpoint</label>
          <input
            className="input"
            placeholder="https://automation.domain.tld/webhook/0123-456789-abc"
            name="endpoint"
            value={form.endpoint || ""}
            onChange={handleChange}
          />
        </div>
      )}
    </>
  );
}
