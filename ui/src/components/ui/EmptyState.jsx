export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon />}
      {title && <div className="title">{title}</div>}
      {children && <div className="body">{children}</div>}
      {action}
    </div>
  );
}
