import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "react-toastify";

import constants from "../../common/constants";
import apiservice from "../../services/api.service";
import { formatBytes, formatDateTime } from "../../common/format";
import FileTypeIcon from "./FileTypeIcon";

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function FilePreview({ file }) {
  const downloadUrl = `${constants.ROOT_URL}/documents/${file.id}`;

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [failed, setFailed] = useState(false);
  const [height, setHeight] = useState(0);
  const stageRef = useRef(null);

  useEffect(() => {
    setPage(1);
    setPages(0);
    setFailed(false);
  }, [file.id]);

  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0].contentBoxSize?.[0];
      if (box) setHeight(box.blockSize);
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [failed]);

  const onDownload = (exportType) => {
    const ext = exportType === "rmdoc" ? ".rmdoc" : ".pdf";
    apiservice
      .download(file.id, exportType)
      .then((blob) => triggerDownload(blob, file.name + ext))
      .catch((e) => toast.error("Download failed: " + e.message));
  };

  if (failed) {
    return (
      <div className="preview" style={{ height: "100%" }}>
        <div className="preview-fallback">
          <FileTypeIcon entry={file} size={44} />
          <div>
            <div className="pf-name">{file.name}</div>
            <div className="pf-meta">
              {file.type} · {formatBytes(file.size)} · {formatDateTime(file.lastModified)}
            </div>
          </div>
          <p className="muted" style={{ maxWidth: 340, fontSize: "var(--text-sm)" }}>
            This file can't be previewed in the browser. Download it instead.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={() => onDownload()}>
              <Download /> PDF
            </button>
            <button className="btn btn-outline" onClick={() => onDownload("rmdoc")}>
              <Download /> .rmdoc
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview">
      <div className="preview-stage" ref={stageRef}>
        {height > 0 && (
          <Document
            file={downloadUrl}
           
            onLoadSuccess={(pdf) => setPages(pdf.numPages)}
            onLoadError={() => setFailed(true)}
            loading={
              <div className="preview-loading">
                <span className="spinner" />
              </div>
            }
          >
            <Page
              pageNumber={page}
              height={Math.max(height - 16, 200)}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        )}
      </div>

      {pages > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "var(--sp-3) 0 0",
          }}
        >
          <div className="preview-pager">
            <button
              className="icon-btn sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              className="icon-btn sm"
              onClick={() => setPage((p) => Math.min(p + 1, pages))}
              disabled={page >= pages}
              aria-label="Next page"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export so the toolbar can share download logic
export { triggerDownload };
