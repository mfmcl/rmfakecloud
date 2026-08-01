export default function Spinner({ label = "Loading…" }) {
  return (
    <div className="loading-box">
      <span className="spinner" role="status" aria-label={label} />
      <span>{label}</span>
    </div>
  );
}
