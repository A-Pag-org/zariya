export function SectionCard({ title, children, className = "" }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}
