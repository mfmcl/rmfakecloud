import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { ArrowRight, CloudUpload, FileText } from "lucide-react";

import apiservice from "../../services/api.service";
import { uploadFilesInBatches } from "../../common/upload";
import { formatBytes, relativeTime } from "../../common/format";
import EmptyState from "../../components/ui/EmptyState";
import {
  collectFiles,
  composeTree,
  countEntries,
  pathLabel,
} from "../Documents/tree-utils";
import FileTypeIcon from "../Documents/FileTypeIcon";

const ACCEPT = {
  "application/pdf": [],
  "application/zip": [".zip", ".rmdoc"],
  "application/epub+zip": [],
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const history = useHistory();
  const [tree, setTree] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiservice
      .listDocument()
      .then((data) => !cancelled && setTree(composeTree(data)))
      .catch((e) => toast.error(e.toString()));
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const { recent, files, folders } = useMemo(() => {
    if (!tree) return { recent: [], files: 0, folders: 0 };
    const all = collectFiles(tree.root);
    const counts = countEntries(tree.root);
    const recent = all
      .slice()
      .sort(
        (a, b) =>
          new Date(b.file.lastModified || 0) - new Date(a.file.lastModified || 0)
      )
      .slice(0, 8);
    return { recent, files: counts.files, folders: counts.folders };
  }, [tree]);

  const onDrop = async (accepted) => {
    if (!accepted.length) return;
    try {
      setUploading(true);
      await uploadFilesInBatches(accepted, "root");
      toast.success(
        accepted.length === 1 ? "File uploaded" : `${accepted.length} files uploaded`
      );
      setReloadCount((c) => c + 1);
    } catch (e) {
      toast.error("Upload error: " + e.toString());
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: onDrop,
    accept: ACCEPT,
    maxSize: 1024 * 1024 * 1024,
    disabled: uploading,
  });

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page">
      <div className="page-inner">
        <header className="home-hero">
          <span className="eyebrow date">{today}</span>
          <h1>{greeting()}.</h1>
          <p className="lede">
            {tree
              ? files === 0
                ? "Your library is empty — add your first document."
                : `Your library holds ${files} document${files === 1 ? "" : "s"}${
                    folders ? ` across ${folders} folder${folders === 1 ? "" : "s"}` : ""
                  }.`
              : "Loading your library…"}
          </p>
        </header>

        <div className="home-grid">
          <div
            {...getRootProps({
              className: `upload-card ${isDragActive ? "dragging" : ""} ${
                uploading ? "uploading" : ""
              }`,
            })}
          >
            <input {...getInputProps()} />
            <span className="up-icon">
              {uploading ? <span className="spinner" /> : <CloudUpload />}
            </span>
            <div>
              <div className="up-title">
                {uploading ? "Uploading…" : "Quick upload"}
              </div>
              <div className="up-sub">
                Drop PDFs, EPUBs or .rmdoc files here, or click to browse.
                Files land in My Files.
              </div>
            </div>
          </div>

          <section className="card">
            <div
              className="row-between"
              style={{ padding: "var(--sp-4) var(--sp-5) var(--sp-2)" }}
            >
              <span className="eyebrow">Recent documents</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => history.push("/documents")}
              >
                View all <ArrowRight />
              </button>
            </div>

            {recent.length === 0 && (
              <EmptyState icon={FileText} title={tree ? "Nothing here yet" : "Loading…"}>
                {tree
                  ? "Documents you sync or upload will show up here."
                  : "Fetching your library."}
              </EmptyState>
            )}

            {recent.length > 0 && (
              <div className="recent-list">
                {recent.map(({ file, trail }) => (
                  <button
                    key={file.id}
                    className="recent-row"
                    onClick={() => history.push(`/documents/${file.id}`)}
                  >
                    <span className="file-tile">
                      <FileTypeIcon entry={file} />
                    </span>
                    <span className="r-name">
                      {file.name}
                      <span className="r-path">
                        {pathLabel(trail) || "My Files"}
                      </span>
                    </span>
                    <span className="r-meta">
                      <span className="r-size">{formatBytes(file.size)} · </span>
                      {relativeTime(file.lastModified)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
