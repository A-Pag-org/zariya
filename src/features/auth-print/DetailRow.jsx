export function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <dt className="detail-label">{label}</dt>
      <dd className="detail-value">{value || "-"}</dd>
    </div>
  );
}
