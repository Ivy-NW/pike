import Link from "next/link";

/** Honest placeholder for sections without backend support yet. */
export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>{title}</h1>
          <p>One place to keep your venue operations consistent.</p>
        </div>
      </div>
      <div className="card empty-state empty-state-panel">
        <span className="badge badge-info">In development</span>
        <h2>We&apos;re building this workspace</h2>
        <p>{body}</p>
        <Link href="/home" className="secondary">Return to dashboard</Link>
      </div>
    </>
  );
}
