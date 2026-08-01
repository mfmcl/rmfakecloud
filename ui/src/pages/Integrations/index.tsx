import { useState } from "react";
import { toast } from "react-toastify";
import { Blocks, Plus, Trash2 } from "lucide-react";

import useFetch from "../../hooks/useFetch";
import apiService from "../../services/api.service";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import IntegrationModal from "./IntegrationModal";
import NewIntegrationModal from "./NewIntegrationModal";

interface Integration {
  ID: string;
  Name: string;
  Provider: string;
}

const providerLabels: Record<string, string> = {
  localfs: "File system",
  webdav: "WebDAV",
  ftp: "FTP",
  dropbox: "Dropbox",
  webhook: "Webhook",
  ics: "ICS Calendar",
};

const Integrations = () => {
  const [index, setIndex] = useState(0);
  const { data: integrationList, error, loading } = useFetch("integrations", index);
  const [editing, setEditing] = useState<Integration | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => setIndex((i) => i + 1);

  const onSave = () => {
    setEditing(null);
    setCreating(false);
    refresh();
  };

  const remove = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete integration: ${name}?`)) return;
    try {
      await apiService.deleteintegration(id);
      toast.success(`Deleted ${name}`);
      refresh();
    } catch (e) {
      toast.error("Error: " + e);
    }
  };

  return (
    <div className="page">
      <div className="page-inner">
        <header className="page-head row-between">
          <div>
            <h1>Integrations</h1>
            <p className="lede">
              Send documents to external storage and services automatically.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <Plus /> New integration
          </button>
        </header>

        {loading && <Spinner />}

        {error && (
          <Alert kind="error" title="An error occurred">
            {`Error ${error.status}: ${error.statusText}`}
          </Alert>
        )}

        {!loading && !error && integrationList && integrationList.length === 0 && (
          <div className="card">
            <EmptyState icon={Blocks} title="No integrations yet">
              Integrations automatically export your documents to WebDAV, Dropbox,
              a local folder and more.
            </EmptyState>
          </div>
        )}

        {!loading && !error && integrationList && integrationList.length > 0 && (
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Provider</th>
                  <th className="mono">ID</th>
                  <th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {integrationList.map((i: Integration) => (
                  <tr key={i.ID} className="clickable" onClick={() => setEditing(i)}>
                    <td style={{ fontWeight: 500 }}>{i.Name}</td>
                    <td>
                      <span className="badge">{providerLabels[i.Provider] || i.Provider}</span>
                    </td>
                    <td className="mono faint" style={{ fontSize: "var(--text-xs)" }}>
                      {i.ID}
                    </td>
                    <td>
                      <button
                        className="icon-btn sm"
                        title={`Delete ${i.Name}`}
                        onClick={(e) => remove(e, i.ID, i.Name)}
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New integration" wide footer={null}>
        <NewIntegrationModal onSave={onSave} onClose={() => setCreating(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.Name ?? "integration"}`}
        wide
        footer={null}
      >
        <IntegrationModal integration={editing} onSave={onSave} onClose={() => setEditing(null)} />
      </Modal>
    </div>
  );
};

export default Integrations;
