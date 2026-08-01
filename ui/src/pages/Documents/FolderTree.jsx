import { useState } from "react";
import { ChevronRight, House, Trash2 } from "lucide-react";
import { iconFor } from "./FileTypeIcon";

function TreeNode({ node, depth, selectedId, onSelect, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const folders = (node.children || []).filter((c) => c.isFolder);
  const hasKids = folders.length > 0;
  const isSelected = node.id === selectedId;
  const isAncestorOfSelection = !isSelected && isAncestor(node, selectedId);
  const expanded = open || isAncestorOfSelection || isSelected;

  const Icon = iconFor(node);

  return (
    <div>
      <button
        className={`tree-item ${isSelected ? "active" : ""}`}
        onClick={() => {
          onSelect(node);
          if (hasKids) setOpen((o) => (isSelected ? !o : true));
        }}
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

export default function FolderTree({ root, trash, selectedId, onSelect }) {
  if (!root) return null;

  return (
    <div className="docs-tree">
      <button
        className={`tree-item ${selectedId === "root" ? "active" : ""}`}
        onClick={() => onSelect(root)}
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
