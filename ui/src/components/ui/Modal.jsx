import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer, wide }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (e) => {
    if (ref.current && !ref.current.contains(e.target)) onClose?.();
  };

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onBackdrop}>
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        style={wide ? { maxWidth: 640 } : undefined}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
