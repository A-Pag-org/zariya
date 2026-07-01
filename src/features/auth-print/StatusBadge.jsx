const statusClassMap = {
  Active: "badge-active",
  Verified: "badge-active",
  Restricted: "badge-warning",
  Suspended: "badge-error",
  Expired: "badge-error"
};

export function StatusBadge({ label }) {
  const className = statusClassMap[label] || "badge-default";
  return <span className={`status-badge ${className}`}>{label}</span>;
}
