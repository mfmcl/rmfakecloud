import { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import {
  ChevronRight,
  Download,
  FolderPlus,
  House,
  LayoutGrid,
  List,
  Search,
  Trash2,
  Upload as UploadIcon,
} from "lucide-react";

import apiservice from "../../services/api.service";
import { uploadFilesInBatches } from "../../common/upload";
import Dropdown from "../../components/ui/Dropdown";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import DocsSkeleton from "../../components/ui/DocsSkeleton";
import { FolderSearch } from "lucide-react";

import { collectFiles, composeTree, findById, pathLabel } from "./tree-utils";
import FolderTree from "./FolderTree";
import Listing from "./Listing";
import FilePreview from "./FilePreview";

const ACCEPT = {
  "application/pdf": [],
  "application/zip": [".zip", ".rmdoc"],
  "application/epub+zip": [],
};

export default function Documents() {
  const { itemId } = useParams();
  const history = useHistory();

  const [tree, setTree] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const reload = useCallback(() => setReloadCount((c) => c + 1), []);

  const [term, setTerm] = useState("");
  const [view, setView] = useState(() => localStorage.getItem("rmf-view") || "list");
  const [checked, setChecked] = useState(() => new Set());
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const selectedId = itemId || "root";

  // ----- data -----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    apiservice
      .listDocument()
      .then((data) => {
        if (!cancelled) setTree(composeTree(data));
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e);
          toast.error(e.toString());
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const found = useMemo(() => {
    if (!tree) return null;
    return findById(tree.root, selectedId) || findById(tree.trash, selectedId);
  }, [tree, selectedId]);

  // Redirect when the URL points at something that no longer exists
  useEffect(() => {
    if (tree && itemId && !found) {
      toast.warning("Item not found — back to My Files");
      history.replace("/documents");
    }
  }, [tree, itemId, found, history]);

  // Clear transient state when navigating
  useEffect(() => {
    setChecked(new Set());
    setTerm("");
  }, [selectedId]);

  // ----- navigation -----------------------------------------------------
  const navigateTo = useCallback(
    (node) => {
      if (!node) return;
      if (node.id === "root" || node.id === "trash") {
        history.push("/documents");
      } else {
        history.push(`/documents/${node.id}`);
      }
    },
    [history]
  );

  const changeView = (v) => {
    setView(v);
    localStorage.setItem("rmf-view", v);
  };

  // ----- selection helpers ----------------------------------------------
  const node = found?.node || null;
  const trail = found?.trail || [];
  const isFolder = !!node?.isFolder;
  const inTrash = trail[0]?.id === "trash";
  const searching = term.trim().length > 0;

  // The folder uploads should land in
  const uploadTarget = !node
    ? "root"
    : isFolder
      ? node.id
      : trail.length > 1
        ? trail[trail.length - 2].id
        : "root";

  const entries = useMemo(() => {
    if (!node) return [];
    if (searching) {
      const q = term.trim().toLowerCase();
      return collectFiles(tree.root)
        .filter(({ file }) => file.name.toLowerCase().includes(q))
        .map(({ file, trail }) => ({ ...file, _trail: trail }));
    }
    return isFolder ? node.children || [] : [];
  }, [node, searching, term, tree, isFolder]);

  const searchPaths = useMemo(() => {
    if (!searching) return null;
    const map = {};
    entries.forEach((e) => {
      map[e.id] = pathLabel(e._trail) || "My Files";
    });
    return map;
  }, [entries, searching]);

  // ----- actions ----------------------------------------------------------
  const onDropFiles = async (files) => {
    if (!files.length) return;
    try {
      setUploading(true);
      await uploadFilesInBatches(files, uploadTarget);
      toast.success(
        files.length === 1 ? "File uploaded" : `${files.length} files uploaded`
      );
      reload();
    } catch (e) {
      toast.error("Upload error: " + e.toString());
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDropAccepted: onDropFiles,
    accept: ACCEPT,
    maxSize: 1024 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
    disabled: uploading,
  });

  const onCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await apiservice.createFolder({ name: folderName.trim(), parentId: selectedId });
      setFolderName("");
      setShowNewFolder(false);
      reload();
    } catch (e) {
      toast.error(e.toString());
    }
  };

  const onDelete = async () => {
    setShowDelete(false);
    const ids = [...checked];
    let failed = 0;
    for (const id of ids) {
      try {
        await apiservice.deleteDocument(id);
      } catch (e) {
        failed += 1;
      }
    }
    if (failed) toast.error(`Failed to delete ${failed} item(s)`);
    else toast.success(ids.length === 1 ? "Deleted 1 item" : `Deleted ${ids.length} items`);
    setChecked(new Set());
    reload();
  };

  const onDownload = (exportType) => {
    const ext = exportType === "rmdoc" ? ".rmdoc" : ".pdf";
    apiservice
      .download(node.id, exportType)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = node.name + ext;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((e) => toast.error("Download failed: " + e.message));
  };

  const toggleCheck = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setChecked((prev) =>
      prev.size === entries.length ? new Set() : new Set(entries.map((e) => e.id))
    );

  // ----- render -----------------------------------------------------------
  if (loadError) {
    return (
      <div className="page">
        <div className="page-inner">
          <EmptyState icon={FolderSearch} title="Couldn't load your files">
            {loadError.toString()}
          </EmptyState>
        </div>
      </div>
    );
  }

  if (!tree) {
    return <DocsSkeleton />;
  }

  const crumbs = searching
    ? null
    : trail.map((n, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={n.id} style={{ display: "inline-flex", alignItems: "center", minWidth: 0 }}>
            {i > 0 && <ChevronRight className="crumb-sep" />}
            <button
              className={`crumb ${last ? "current" : ""}`}
              onClick={() => !last && navigateTo(n)}
            >
              {i === 0 && n.id === "root" && <House />}
              {n.name}
            </button>
          </span>
        );
      });

  return (
    <div className="page-fill">
      <div className="docs">
        <aside className="docs-side">
          <div className="docs-side-head">
            <div className="search-box">
              <Search />
              <input
                className="input"
                placeholder="Search files…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
          </div>
          <FolderTree
            root={tree.root}
            trash={tree.trash}
            selectedId={selectedId}
            onSelect={navigateTo}
          />
        </aside>

        <section className="docs-main">
          <div className="docs-toolbar">
            {searching ? (
              <span className="muted" style={{ fontSize: "var(--text-sm)" }}>
                {entries.length} result{entries.length === 1 ? "" : "s"} for “{term.trim()}”
              </span>
            ) : (
              <nav className="crumbs" aria-label="Breadcrumb">
                {crumbs}
              </nav>
            )}

            <div className="spacer" />

            <div className="search-box docs-mobile-search">
              <Search />
              <input
                className="input"
                placeholder="Search files…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>

            {!node?.isFolder && node && (
              <Dropdown
                toggle={({ toggle }) => (
                  <button className="icon-btn bordered" onClick={toggle} title="Download">
                    <Download />
                  </button>
                )}
              >
                <button className="dropdown-item" onClick={() => onDownload()}>
                  Download PDF
                </button>
                <button className="dropdown-item" onClick={() => onDownload("rmdoc")}>
                  Download .rmdoc
                </button>
              </Dropdown>
            )}

            {checked.size > 0 && (
              <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>
                <Trash2 /> Delete ({checked.size})
              </button>
            )}

            {isFolder && !inTrash && (
              <>
                <button
                  className="icon-btn bordered"
                  onClick={() => setShowNewFolder(true)}
                  title="New folder"
                >
                  <FolderPlus />
                </button>
                <button
                  className="icon-btn bordered"
                  onClick={open}
                  title="Upload files"
                  disabled={uploading}
                >
                  {uploading ? <span className="spinner sm" /> : <UploadIcon />}
                </button>
              </>
            )}

            {isFolder && (
              <div className="segmented" role="group" aria-label="View">
                <button onClick={() => changeView("list")} aria-pressed={view === "list"} title="List view">
                  <List />
                </button>
                <button onClick={() => changeView("grid")} aria-pressed={view === "grid"} title="Grid view">
                  <LayoutGrid />
                </button>
              </div>
            )}
          </div>

          <div className="docs-body" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive && <div className="docs-drop-veil">Drop files to upload</div>}

            {node && !isFolder && <FilePreview file={node} />}

            {isFolder && entries.length > 0 && (
              <Listing
                view={view}
                entries={entries}
                checked={checked}
                onToggleCheck={toggleCheck}
                onToggleAll={toggleAll}
                onOpen={navigateTo}
                subtitle={
                  searching ? (entry) => searchPaths?.[entry.id] : undefined
                }
              />
            )}

            {isFolder && entries.length === 0 && (
              <EmptyState
                icon={searching ? Search : FolderPlus}
                title={searching ? "No matches" : "This folder is empty"}
              >
                {searching
                  ? `Nothing in your library matches “${term.trim()}”.`
                  : "Drag files here, or use the upload button to add PDFs and EPUBs."}
              </EmptyState>
            )}
          </div>
        </section>
      </div>

      <Modal
        open={showNewFolder}
        onClose={() => setShowNewFolder(false)}
        title="New folder"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowNewFolder(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onCreateFolder} disabled={!folderName.trim()}>
              Create folder
            </button>
          </>
        }
      >
        <div className="field">
          <label htmlFor="folder-name">Folder name</label>
          <input
            id="folder-name"
            className="input"
            autoFocus
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
            placeholder="e.g. Notebooks"
          />
        </div>
      </Modal>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete selected items?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowDelete(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onDelete}>
              Delete {checked.size} item{checked.size === 1 ? "" : "s"}
            </button>
          </>
        }
      >
        <p className="muted" style={{ margin: 0 }}>
          {inTrash
            ? "Items in the trash will be permanently deleted."
            : "Selected items will be moved to the trash."}
        </p>
      </Modal>
    </div>
  );
}
