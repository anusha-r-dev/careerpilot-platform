export function LoadingPage() {
  return (
    <main className="system-page" role="status">
      <span className="system-logo">HF</span>
      <strong>Opening CareerPilot…</strong>
    </main>
  )
}

export function AccessDeniedPage({ onLogout }: { onLogout: () => void }) {
  return (
    <main className="system-page">
      <span className="system-logo">!</span>
      <p className="eyebrow">Access restricted</p>
      <h1>This page belongs to a different account role.</h1>
      <p>Sign out and use the portal that matches your account.</p>
      <button className="button button--dark" type="button" onClick={onLogout}>
        Sign out
      </button>
    </main>
  )
}
