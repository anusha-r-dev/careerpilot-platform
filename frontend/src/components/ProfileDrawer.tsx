import { useEffect, useId } from 'react'
import type { MemberDashboard, User } from '../types'
import { AppIcon } from './AppIcon'

interface ProfileDrawerProps {
  sourceCount: number
  summary: MemberDashboard['summary']
  user: User
  onClose: () => void
  onSignOut: () => Promise<void>
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileDrawer({
  sourceCount,
  summary,
  user,
  onClose,
  onSignOut,
}: ProfileDrawerProps) {
  const titleId = useId()

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      className="profile-drawer-layer"
      role="presentation"
      onMouseDown={onClose}
    >
      <aside
        aria-labelledby={titleId}
        aria-modal="true"
        className="profile-drawer"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="profile-drawer__topbar">
          <p>Member profile</p>
          <button autoFocus aria-label="Close profile" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="profile-drawer__identity">
          <span aria-hidden="true">{initials(user.name)}</span>
          <div>
            <span className="profile-active-badge">
              <i /> Active member
            </span>
            <h2 id={titleId}>{user.name}</h2>
            <p>{user.headline ?? 'CareerPilot member'}</p>
          </div>
        </div>

        <dl className="profile-details">
          <div>
            <dt>Email address</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{user.location ?? 'Not provided'}</dd>
          </div>
          <div>
            <dt>Account type</dt>
            <dd>Private member workspace</dd>
          </div>
        </dl>

        <section className="profile-activity" aria-label="Job search overview">
          <div>
            <p>Job search overview</p>
            <span>Visible only to you</span>
          </div>
          <div className="profile-stat-grid">
            <article>
              <strong>{summary.total}</strong>
              <small>Total roles</small>
            </article>
            <article>
              <strong>{summary.active}</strong>
              <small>Active</small>
            </article>
            <article>
              <strong>{summary.interviews}</strong>
              <small>Interviews</small>
            </article>
            <article>
              <strong>{sourceCount}</strong>
              <small>Sources used</small>
            </article>
          </div>
        </section>

        <div className="profile-privacy-note">
          <AppIcon name="lock" size={17} />
          <p>
            Your portal shortcuts and application records are isolated from
            other members. Administrators see platform totals, not your private
            job-search details.
          </p>
        </div>

        <div className="profile-drawer__actions">
          <button type="button" onClick={onClose}>Return to workspace</button>
          <button type="button" onClick={() => void onSignOut()}>
            Sign out
            <AppIcon name="arrow" size={15} />
          </button>
        </div>
      </aside>
    </div>
  )
}
