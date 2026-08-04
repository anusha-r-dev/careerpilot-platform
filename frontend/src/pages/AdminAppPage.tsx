import { useAuth } from '../auth/useAuth'
import { AppIcon } from '../components/AppIcon'
import { Brand } from '../components/Brand'
import { statusLabels } from '../constants/applications'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import type { ApplicationStatus } from '../types'

interface AdminAppPageProps {
  onNavigate: (path: string) => void
}

const visibleStatuses: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
]

export function AdminAppPage({ onNavigate }: AdminAppPageProps) {
  const auth = useAuth()
  const dashboard = useAdminDashboard()
  const data = dashboard.data
  const user = auth.user
  const summary = data?.summary ?? {
    members: 0,
    active_members: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
    sources: 0,
  }

  async function logout() {
    await auth.logout()
    onNavigate('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="admin-app">
      <a className="skip-link" href="#admin-content">
        Skip to main content
      </a>

      <header className="admin-header">
        <a href="#overview" aria-label="CareerPilot administrator home">
          <Brand />
        </a>
        <nav aria-label="Administrator navigation">
          <a href="#overview">Overview</a>
          <a href="#members">Members</a>
          <a href="#sources">Job sources</a>
        </nav>
        <div>
          <span>Administrator</span>
          <strong>{user.name}</strong>
          <button type="button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main id="admin-content">
        <section className="admin-overview" id="overview">
          <div className="admin-title">
            <div>
              <p className="eyebrow">Platform administration</p>
              <h1>People supported,<br />privacy protected.</h1>
            </div>
            <aside>
              <AppIcon name="shield" size={24} />
              <div>
                <strong>Privacy-safe overview</strong>
                <p>
                  You can manage accounts and sources. Private company names,
                  job links and personal notes are not returned here.
                </p>
              </div>
            </aside>
          </div>

          {dashboard.error && (
            <div className="admin-error" role="alert">
              <strong>Administrator data is unavailable.</strong>
              <span>{dashboard.error}</span>
              <button
                type="button"
                onClick={() => void dashboard.refresh().catch(() => undefined)}
              >
                Retry
              </button>
            </div>
          )}

          <div className="admin-metrics" aria-label="Platform summary">
            <article className="admin-metric--yellow">
              <span>01</span>
              <strong>{summary.active_members}</strong>
              <p>Active member accounts</p>
            </article>
            <article className="admin-metric--orange">
              <span>02</span>
              <strong>{summary.applications}</strong>
              <p>Applications tracked</p>
            </article>
            <article className="admin-metric--violet">
              <span>03</span>
              <strong>{summary.interviews}</strong>
              <p>At interview stage</p>
            </article>
            <article className="admin-metric--green">
              <span>04</span>
              <strong>{summary.offers}</strong>
              <p>Offers recorded</p>
            </article>
          </div>

          <div className="stage-distribution">
            <div>
              <p className="eyebrow">Aggregate workflow</p>
              <h2>Application stage distribution</h2>
            </div>
            <div className="stage-bars">
              {visibleStatuses.map((status) => {
                const count = data?.status_counts[status] ?? 0
                const maximum = Math.max(summary.applications, 1)

                return (
                  <div key={status}>
                    <span>{statusLabels[status]}</span>
                    <i><b style={{ width: `${(count / maximum) * 100}%` }} /></i>
                    <strong>{count}</strong>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="members-section" id="members">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">Account management</p>
              <h2>Registered members</h2>
              <p>Activate or suspend access without opening private applications.</p>
            </div>
            <span>{summary.members} registered accounts</span>
          </div>

          <div className="member-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Career focus</th>
                  <th>Applications</th>
                  <th>Interviews</th>
                  <th>Access</th>
                  <th><span className="sr-only">Account action</span></th>
                </tr>
              </thead>
              <tbody>
                {(data?.members ?? []).map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className="table-avatar" aria-hidden="true">
                        {member.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                      <span>
                        <strong>{member.name}</strong>
                        <small>{member.email}</small>
                      </span>
                    </td>
                    <td>
                      <strong>{member.headline || 'Not provided'}</strong>
                      <small>{member.location || 'Location not provided'}</small>
                    </td>
                    <td>{member.application_count}</td>
                    <td>{member.interview_count}</td>
                    <td>
                      <span className={member.active ? 'access-active' : 'access-paused'}>
                        {member.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          void dashboard
                            .setMemberActive(member, !member.active)
                            .catch(() => undefined)
                        }
                      >
                        {member.active ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-sources-section" id="sources">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">Discovery directory</p>
              <h2>Trusted job sources</h2>
              <p>Control which external search shortcuts members can see.</p>
            </div>
            <span>{summary.sources} active sources</span>
          </div>

          <div className="admin-source-grid">
            {(data?.sources ?? []).map((source) => (
              <article key={source.id} className={!source.active ? 'is-inactive' : ''}>
                <span className={`source-card__mark source-card--${source.accent}`}>
                  {source.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h3>{source.name}</h3>
                  <a href={source.home_url} rel="noreferrer" target="_blank">
                    Visit source <AppIcon name="external" size={14} />
                  </a>
                </div>
                <button
                  aria-pressed={source.active}
                  className="source-toggle"
                  type="button"
                  onClick={() =>
                    void dashboard
                      .setSourceActive(source, !source.active)
                      .catch(() => undefined)
                  }
                >
                  <i />
                  {source.active ? 'Visible' : 'Hidden'}
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
