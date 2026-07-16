/** FR-13: per-tab scan session id, used to detect repeat scans within the same visit. */
export function sessionId(): string {
  const key = "pike_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}
