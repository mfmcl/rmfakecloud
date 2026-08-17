import { useState } from "react";
import { ChevronRight, House, Trash2 } from "lucide-react";
import { iconFor } from "./FileTypeIcon";

const MOVE_MIME = "application/x-rmf-move";

function hasMovePayload(e) {
  const types = e.dataTransfer?.types || [];
  return types.includes(MOVE_MIME);
}

// Drop behaviour for a tree item. Only reacts to our internal move drags.
function makeTreeDropHandlers(id, onFolderTarget, onFolderDrop) {
  return {
    onDragOver: (e) => {
      if (!hasMovePayload(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      onFolderTarget?.(id);
    },
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        onFolderTarget?.(null);
      }
    },
    onDrop: (e) => {
      if (!hasMovePayload(e)) return;
      e.preventDefault();
      onFolderDrop?.(id, e);
    },
  };
}

function TreeNode({ node, depth, selectedId, onSelect, defaultOpen, dropId, onFolderTarget, onFolderDrop }) {
  const [open, setOpen] = useState(defaultOpen);
  const folders = (node.children || []).filter((c) => c.isFolder);
  const hasKids = folders.length > 0;
  const isSelected = node.id === selectedId;
  const isAncestorOfSelection = !isSelected && isAncestor(node, selectedId);
  const expanded = open || isAncestorOfSelection || isSelected;
  const isDrop = dropId === node.id;

  const Icon = iconFor(node);

  return (
    <div>
      <button
        className={`tree-item ${isSelected ? "active" : ""} ${isDrop ? "drop-target" : ""}`}
        onClick={() => {
          onSelect(node);
          if (hasKids) setOpen((o) => (isSelected ? !o : true));
        }}
        {...makeTreeDropHandlers(node.id, onFolderTarget, onFolderDrop)}
      >
        <ChevronRight
          className={`tree-chev ${expanded ? "open" : ""} ${hasKids ? "" : "leaf"}`}
        />
        <Icon className="tree-ico" />
        <span className="tree-label">{node.name}</span>
      </button>
      {hasKids && expanded && (
        <div className="tree-children">
          {folders.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultOpen={false}
              dropId={dropId}
              onFolderTarget={onFolderTarget}
              onFolderDrop={onFolderDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function isAncestor(node, id) {
  for (const child of node.children || []) {
    if (child.id === id) return true;
    if (child.isFolder && isAncestor(child, id)) return true;
  }
  return false;
}

export default function FolderTree({
  root,
  trash,
  selectedId,
  onSelect,
  dropId = null,
  onFolderTarget,
  onFolderDrop,
}) {
  if (!root) return null;

  return (
    <div className="docs-tree">
      <button
        className={`tree-item ${selectedId === "root" ? "active" : ""} ${dropId === "root" ? "drop-target" : ""}`}
        onClick={() => onSelect(root)}
        {...makeTreeDropHandlers("root", onFolderTarget, onFolderDrop)}
      >
        <ChevronRight className="tree-chev leaf" />
        <House className="tree-ico" />
        <span className="tree-label">My Files</span>
      </button>
      <div className="tree-children">
        {(root.children || [])
          .filter((c) => c.isFolder)
          .map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultOpen={false}
              dropId={dropId}
              onFolderTarget={onFolderTarget}
              onFolderDrop={onFolderDrop}
            />
          ))}
      </div>

      <div className="tree-sep" />

      <button
        className={`tree-item ${selectedId === "trash" ? "active" : ""}`}
        onClick={() => onSelect(trash)}
      >
        <ChevronRight className="tree-chev leaf" />
        <Trash2 className="tree-ico" />
        <span className="tree-label">Trash</span>
      </button>
    </div>
  );
}