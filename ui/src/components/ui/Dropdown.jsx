import { useState, useEffect, useRef } from "react";

/**
 * Minimal dropdown. `toggle` is a render prop receiving { open, toggle }.
 * Children are menu content (use .dropdown-item buttons / .dropdown-sep).
 */
export default function Dropdown({ toggle, children, align = "end", up = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="dropdown" ref={ref}>
      {toggle({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          className={`dropdown-menu ${align === "start" ? "align-start" : ""}`}
          style={up ? { top: "auto", bottom: "calc(100% + 6px)" } : undefined}
          onClick={close}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
