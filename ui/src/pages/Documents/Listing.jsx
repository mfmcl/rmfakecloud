import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { formatBytes, formatDate } from "../../common/format";
import FileTypeIcon from "./FileTypeIcon";

function itemCount(entry) {
  const n = (entry.children || []).length;
  return `${n} item${n === 1 ? "" : "s"}`;
}

function SortHeader({ label, field, sort, onSort, className = "" }) {
  const active = sort.field === field;
  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      className={`fh ${className}`}
      onClick={() => onSort(field)}
      style={active ? { color: "var(--ink)" } : undefined}
    >
      {label}
      <Icon style={active ? undefined : { opacity: 0.45 }} />
    </button>
  );
}

function sortEntries(entries, sort) {
  const dir = sort.dir === "asc" ? 1 : -1;
  const cmp = (a, b) => {
    switch (sort.field) {
      case "name":
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) * dir;
      case "size": {
        const sa = a.isFolder ? -1 : a.size || 0;
        const sb = b.isFolder ? -1 : b.size || 0;
        return (sa - sb) * dir;
      }
      case "modified": {
        const da = new Date(a.lastModified || 0).getTime();
        const db = new Date(b.lastModified || 0).getTime();
        return (da - db) * dir;
      }
      default:
        return 0;
    }
  };
  return [...entries].sort(cmp);
}

// Folders first in every sort.
function foldersFirst(entries) {
  const folders = entries.filter((e) => e.isFolder);
  const files = entries.filter((e) => !e.isFolder);
  return [...folders, ...files];
}

const MOVE_MIME = "application/x-rmf-move";

function hasMovePayload(e) {
  const types = e.dataTransfer?.types || [];
  return types.includes(MOVE_MIME);
}

// Drag behaviour for a row/card: draggable when enabled, dragging a checked
// item carries the whole selection (handled by onEntryDragStart in the parent).
function makeDragHandlers(draggable, onEntryDragStart, onDragEnd) {
  return (entry) => ({
    draggable: !!draggable,
    onDragStart: draggable
      ? (e) => {
          e.stopPropagation();
          onEntryDragStart?.(entry, e);
        }
      : undefined,
    onDragEnd: draggable
      ? (e) => {
          e.stopPropagation();
          onDragEnd?.(e);
        }
      : undefined,
  });
}

// Drop behaviour for a folder row/card. Only reacts to our internal move
// drags — file drags (uploads) are left to the surrounding dropzone.
function makeFolderDropHandlers(onFolderTarget, onFolderDrop) {
  return (entry) =>
    entry.isFolder
      ? {
          onDragOver: (e) => {
            if (!hasMovePayload(e)) return;
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
            onFolderTarget?.(entry.id);
          },
          onDragLeave: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              onFolderTarget?.(null);
            }
          },
          onDrop: (e) => {
            if (!hasMovePayload(e)) return;
            e.preventDefault();
            e.stopPropagation();
            onFolderDrop?.(entry.id, e);
          },
        }
      : {};
}

export default function Listing({
  view,
  entries,
  checked,
  onToggleCheck,
  onToggleAll,
  onOpen,
  subtitle,
  draggable = false,
  dropId = null,
  onEntryDragStart,
  onDragEnd,
  onFolderTarget,
  onFolderDrop,
}) {
  const [sort, setSort] = useState({ field: "modified", dir: "desc" });

  const onSort = (field) =>
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: field === "modified" ? "desc" : "asc" }
    );

  const sorted = useMemo(
    () => foldersFirst(sortEntries(entries, sort)),
    [entries, sort]
  );

  const allChecked = entries.length > 0 && entries.every((e) => checked.has(e.id));

  if (view === "grid") {
    return (
      <div className="file-grid">
        {sorted.map((entry) => (
          <div
            key={entry.id}
            className={`file-card ${checked.has(entry.id) ? "checked" : ""} ${entry.isFolder && dropId === entry.id ? "drop-target" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(entry)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(entry)}
            {...makeDragHandlers(draggable, onEntryDragStart, onDragEnd)(entry)}
            {...makeFolderDropHandlers(onFolderTarget, onFolderDrop)(entry)}
          >
            <input
              type="checkbox"
              className="tick"
              checked={checked.has(entry.id)}
              onChange={() => onToggleCheck(entry.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${entry.name}`}
            />
            <span className="fc-icon">
              <FileTypeIcon entry={entry} size={26} />
            </span>
            <span className="fc-name" title={entry.name}>
              {entry.name}
            </span>
            <span className="fc-meta">
              {entry.isFolder
                ? itemCount(entry)
                : formatBytes(entry.size)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="file-rows">
      <div className="file-rows-head">
        <input
          type="checkbox"
          className="tick"
          checked={allChecked}
          onChange={onToggleAll}
          aria-label="Select all"
        />
        <span />
        <SortHeader label="Name" field="name" sort={sort} onSort={onSort} />
        <SortHeader label="Size" field="size" sort={sort} onSort={onSort} />
        <SortHeader label="Modified" field="modified" sort={sort} onSort={onSort} className="modified" />
      </div>
      {sorted.map((entry) => (
        <div
          key={entry.id}
          className={`file-row ${checked.has(entry.id) ? "checked" : ""} ${entry.isFolder && dropId === entry.id ? "drop-target" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(entry)}
          onKeyDown={(e) => e.key === "Enter" && onOpen(entry)}
          {...makeDragHandlers(draggable, onEntryDragStart, onDragEnd)(entry)}
          {...makeFolderDropHandlers(onFolderTarget, onFolderDrop)(entry)}
        >
          <input
            type="checkbox"
            className="tick"
            checked={checked.has(entry.id)}
            onChange={() => onToggleCheck(entry.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${entry.name}`}
          />
          <span className="fr-ico">
            <FileTypeIcon entry={entry} />
          </span>
          <span className="fr-name" title={entry.name}>
            {entry.name}
            {subtitle && <span className="fr-sub">{subtitle(entry)}</span>}
          </span>
          <span className="fr-meta">
            {entry.isFolder ? itemCount(entry) : formatBytes(entry.size)}
          </span>
          <span className="fr-meta modified">{formatDate(entry.lastModified)}</span>
        </div>
      ))}
    </div>
  );
}
