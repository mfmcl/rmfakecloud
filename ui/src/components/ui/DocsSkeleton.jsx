/* Skeleton placeholder for the Documents page — mimics the sidebar + main layout */

function Bar({ w = "100%", h = 14, style }) {
  return (
    <span
      className="skel-bar"
      aria-hidden="true"
      style={{ width: w, height: h, ...style }}
    />
  );
}

function TreeRow({ indent = 0, pct = 60 }) {
  return (
    <div className="skel-tree-row" style={{ paddingLeft: 8 + indent * 20 }}>
      <Bar w={14} h={14} style={{ flex: "none", borderRadius: "var(--r-xs)" }} />
      <Bar w={`${pct}%`} h={12} />
    </div>
  );
}

function FileRow({ pct = 55 }) {
  return (
    <div className="skel-file-row">
      <Bar w={16} h={16} style={{ flex: "none", borderRadius: "var(--r-xs)" }} />
      <Bar w={30} h={17} style={{ flex: "none", borderRadius: "var(--r-sm)" }} />
      <Bar w={`${pct}%`} h={14} />
      <Bar w={72} h={12} style={{ flex: "none", marginLeft: "auto" }} />
    </div>
  );
}

export default function DocsSkeleton() {
  return (
    <div className="page-fill">
      <div className="docs">
        {/* Sidebar skeleton */}
        <aside className="docs-side" aria-hidden="true">
          <div className="docs-side-head">
            <Bar w="100%" h={33} style={{ borderRadius: "var(--r-full)" }} />
          </div>
          <div className="docs-tree">
            <TreeRow pct={55} />
            <TreeRow indent={1} pct={70} />
            <TreeRow indent={1} pct={45} />
            <TreeRow indent={0} pct={65} />
            <TreeRow indent={1} pct={50} />
            <TreeRow indent={0} pct={60} />
            <TreeRow pct={40} />
            <TreeRow indent={1} pct={75} />
          </div>
        </aside>

        {/* Main skeleton */}
        <section className="docs-main" aria-hidden="true">
          {/* Toolbar skeleton */}
          <div className="docs-toolbar">
            <Bar w={120} h={16} />
            <Bar w={80} h={16} />
            <div className="spacer" />
            <Bar w={34} h={34} style={{ borderRadius: "var(--r-sm)" }} />
            <Bar w={34} h={34} style={{ borderRadius: "var(--r-sm)" }} />
          </div>

          {/* File rows skeleton */}
          <div className="docs-body">
            <FileRow pct={48} />
            <FileRow pct={62} />
            <FileRow pct={35} />
            <FileRow pct={55} />
            <FileRow pct={70} />
            <FileRow pct={42} />
            <FileRow pct={58} />
            <FileRow pct={50} />
          </div>
        </section>
      </div>
    </div>
  );
}
