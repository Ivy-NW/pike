import Link from "next/link";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";

/**
 * Self-service reset isn't built yet — there's no email provider configured
 * (see register/page.tsx) and no reset-token endpoint in apps/api. Rather than
 * ship a form that silently does nothing, this is an honest interim state.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthSplitPanel>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Reset your password</h2>
      <p style={{ color: "var(--on-surface-variant)", marginBottom: 24 }}>
        Self-service password reset isn&apos;t available yet. Email us and we&apos;ll verify your
        identity and reset it manually.
      </p>
      <a href="mailto:support@pike.app?subject=Password%20reset" className="btn btn-primary" style={{ width: "100%" }}>
        Email support@pike.app
      </a>
      <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
        <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Back to login</Link>
      </p>
    </AuthSplitPanel>
  );
}
