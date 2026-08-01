import { BookOpen, File, FileText, Folder, NotebookPen, Trash2 } from "lucide-react";

export function iconFor(entry) {
  if (!entry) return File;
  if (entry.id === "trash") return Trash2;
  if (entry.isFolder) return Folder;
  switch (entry.type) {
    case "pdf":
      return FileText;
    case "epub":
      return BookOpen;
    case "notebook":
      return NotebookPen;
    default:
      return File;
  }
}

export default function FileTypeIcon({ entry, size = 17 }) {
  const Icon = iconFor(entry);
  return <Icon size={size} />;
}
