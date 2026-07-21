/** Honest placeholder for sections with no backend yet — same pattern as
 * apps/web/src/app/coming-soon: say so plainly instead of faking functionality. */
export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="card empty-state" style={{ maxWidth: 480 }}>
        <p style={{ fontWeight: 600, color: "var(--on-surface)", marginBottom: 6 }}>Coming soon</p>
        <p>{body}</p>
      </div>
    </>
  );
}
