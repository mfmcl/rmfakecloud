// Helpers for working with the document tree returned by the API.
//
// Entry shapes:
//   folder: { id, name, children: Entry[], lastModified, isFolder: true }
//   file:   { id, name, type, lastModified, size }
//
// The page composes two synthetic top-level nodes: "root" (My Files)
// and "trash" (Trash).

export function composeTree(data) {
  const { Entries = [], Trash = [] } = data || {};
  return {
    root: {
      id: "root",
      name: "My Files",
      isFolder: true,
      children: Entries,
    },
    trash: {
      id: "trash",
      name: "Trash",
      isFolder: true,
      children: Trash,
    },
  };
}

// Depth-first search for `id` within `node`.
// Returns { node, trail } where trail is the list of ancestors
// starting at (and including) the searched root.
export function findById(node, id, trail = []) {
  if (!node) return null;
  const path = [...trail, node];
  if (node.id === id) return { node, trail: path };
  for (const child of node.children || []) {
    const found = findById(child, id, path);
    if (found) return found;
  }
  return null;
}

// All descendant files of `node`, each annotated with the
// breadcrumb-ish path of folder names leading to it.
export function collectFiles(node, trail = []) {
  const path = [...trail, node];
  if (!node.isFolder) {
    return [{ file: node, trail: path }];
  }
  let out = [];
  for (const child of node.children || []) {
    out = out.concat(collectFiles(child, path));
  }
  return out;
}

export function countEntries(node) {
  let folders = 0;
  let files = 0;
  const walk = (n) => {
    if (n.isFolder) {
      folders += 1;
      (n.children || []).forEach(walk);
    } else {
      files += 1;
    }
  };
  (node.children || []).forEach(walk);
  return { folders, files };
}

// Path label excluding the synthetic root, e.g. "Books / Fiction".
export function pathLabel(trail, { skipRoot = true } = {}) {
  const names = trail.map((n) => n.name);
  const sliced = skipRoot ? names.slice(1, -1) : names.slice(0, -1);
  return sliced.join(" / ");
}
