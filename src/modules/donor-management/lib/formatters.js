export function formatCompactCroreFromLakhs(amountInLakhs) {
  const crore = Number(amountInLakhs || 0) / 100;
  return `₹${crore.toFixed(2)} Cr`;
}

export function formatLakhs(amountInLakhs) {
  const value = Number(amountInLakhs || 0);
  return `₹${value.toFixed(2)} L`;
}

export function formatDateTime(dateTimeValue) {
  if (!dateTimeValue) return "-";
  const date = new Date(dateTimeValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
