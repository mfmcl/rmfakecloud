import { useState } from "react";
import { toast } from "react-toastify";
import { Trash2, UserPlus, UsersRound } from "lucide-react";

import useFetch from "../../hooks/useFetch";
import apiService from "../../services/api.service";
import { formatDate } from "../../common/format";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import NewUserModal from "./NewUserModal";
import EditUserModal from "./EditUserModal";

export default function Admin() {
  const [index, setIndex] = useState(0);
  const { data: userList, error, loading } = useFetch("users", index);
  const [editing, setEditing] = useState(null); // user object
  const [creating, setCreating] = useState(false);

  const refresh = () => setIndex((i) => i + 1);

  const onSave = () => {
    setEditing(null);
    setCreating(false);
    refresh();
  };

  const remove = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete user: ${id}?`)) return;
    try {
      await apiService.deleteuser(id);
      toast.success(`Deleted ${id}`);
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
            <span className="eyebrow">Server</span>
            <h1>Users</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <UserPlus /> New user
          </button>
        </header>

        {loading && <Spinner />}

        {error && (
          <Alert kind="error" title="An error occurred">
            {`Error ${error.status}: ${error.statusText}`}
          </Alert>
        )}

        {!loading && !error && userList && userList.length === 0 && (
          <EmptyState icon={UsersRound} title="No users yet" />
        )}

        {!loading && !error && userList && userList.length > 0 && (
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.userid} className="clickable" onClick={() => setEditing(u)}>
                    <td style={{ fontWeight: 500 }}>{u.userid}</td>
                    <td className="muted">{u.email}</td>
                    <td>{u.isAdmin ? <span className="badge">admin</span> : null}</td>
                    <td className="muted">{formatDate(u.CreatedAt)}</td>
                    <td>
                      <button
                        className="icon-btn sm"
                        title={`Delete ${u.userid}`}
                        onClick={(e) => remove(e, u.userid)}
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

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New user"
        footer={null}
      >
        <NewUserModal onSave={onSave} onClose={() => setCreating(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.userid ?? ""}`}
        footer={null}
      >
        <EditUserModal user={editing} onSave={onSave} onClose={() => setEditing(null)} />
      </Modal>
    </div>
  );
}
