import { CircleAlert, Info } from "lucide-react";

export default function Alert({ kind = "info", title, children, className = "" }) {
  const Icon = kind === "error" ? CircleAlert : Info;
  return (
    <div className={`alert alert-${kind} ${className}`} role={kind === "error" ? "alert" : "status"}>
      <Icon />
      <div>
        {title && <div className="alert-title">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
