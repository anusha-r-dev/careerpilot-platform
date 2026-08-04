import { useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { AddApplicationDialog } from '../components/AddApplicationDialog'
import { ApplicationCard } from '../components/ApplicationCard'
import { AppIcon } from '../components/AppIcon'
import { Brand } from '../components/Brand'
import { EmailImportCenter } from '../components/EmailImportCenter'
import { PortalHub } from '../components/PortalHub'
import { ProfileDrawer } from '../components/ProfileDrawer'
import {
  pipelineStatuses,
  statusLabels,
} from '../constants/applications'
import { useMemberDashboard } from '../hooks/useMemberDashboard'
import type { ApplicationStatus, NewApplicationInput } from '../types'

interface MemberAppPageProps {
  onNavigate: (path: string) => void
}

export function MemberAppPage({ onNavigate }: MemberAppPageProps) {
  const auth = useAuth()
  const dashboard = useMemberDashboard()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogSourceId, setDialogSourceId] = useState<number | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const data = dashboard.data
  const user = auth.user
  const applications = useMemo(
    () => data?.applications ?? [],
    [data?.applications],
  )
  const sources = data?.sources ?? []
  const summary = data?.summary ?? {
    total: 0,
    active: 0,
    applied: 0,
    interviews: 0,
    offers: 0,
    actions_due: 0,
  }

  const filteredApplications = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return applications
    }

    return applications.filter((application) =>
      `${application.company} ${application.title} ${application.location ?? ''}`
        .toLowerCase()
        .includes(normalized),
    )
  }, [applications, query])

  async function logout() {
    await auth.logout()
    onNavigate('/')
  }

  async function addApplication(input: NewApplicationInput) {
    await dashboard.createApplication(input)
    setDialogOpen(false)
    setDialogSourceId(null)
  }

  function openApplicationDialog(sourceId: number | null = null) {
    setDialogSourceId(sourceId)
    setDialogOpen(true)
  }

  function closeApplicationDialog() {
    setDialogOpen(false)
    setDialogSourceId(null)
  }

  function changeStatus(id: number, status: ApplicationStatus) {
    void dashboard.updateStatus(id, status).catch(() => undefined)
  }

  if (!user) {
    return null
  }

  return (
    <div className="member-app">
      <a className="skip-link" href="#member-content">
        Skip to main content
      </a>

      <header className="app-header app-header--member">
        <a href="#discover" aria-label="CareerPilot workspace home">
          <Brand dark />
        </a>
        <nav aria-label="Member workspace navigation">
          <a href="#discover">Discover</a>
          <a href="#portals">My portals</a>
          <a href="#pipeline">My pipeline</a>
          <a href="#interviews">Interviews</a>
        </nav>
        <div className="app-account">
          <button
            aria-expanded={profileOpen}
            aria-label={`Open profile for ${user.name}`}
            className="app-profile-trigger"
            type="button"
            onClick={() => setProfileOpen(true)}
          >
            <span className="app-profile-trigger__avatar" aria-hidden="true">
              {user.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
            </span>
            <span className="app-profile-trigger__copy">
              <strong>{user.name}</strong>
              <small>View profile</small>
            </span>
            <AppIcon name="chevron" size={14} />
          </button>
          <button
            className="app-signout-button"
            type="button"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </div>
      </header>

      <main id="member-content">
        <section className="member-discover" id="discover">
          <div className="discover-heading">
            <div>
              <p className="eyebrow">Search broadly. Track privately.</p>
              <h1>Where will you apply next?</h1>
              <p>
                Launch your job portals, open saved applications on the official
                websites, and organize the roles you choose to track.
              </p>
            </div>
            <button
              className="button button--dark button--large"
              type="button"
              onClick={() => openApplicationDialog()}
            >
              <AppIcon name="plus" size={18} />
              Save a job link
            </button>
          </div>

          <p className="external-source-note">
            <AppIcon name="lock" size={16} />
            CareerPilot never asks for a LinkedIn, Naukri, Indeed or other job-site
            password. Authentication stays on each official portal.
          </p>
        </section>

        {dashboard.error && (
          <div className="data-error" role="alert">
            <span>!</span>
            <div>
              <strong>Your private workspace could not be loaded.</strong>
              <p>{dashboard.error}</p>
            </div>
            <button
              type="button"
              onClick={() => void dashboard.refresh().catch(() => undefined)}
            >
              Retry
            </button>
          </div>
        )}

        <section className="personal-summary" aria-label="Application summary">
          <article>
            <span><AppIcon name="briefcase" size={20} /></span>
            <div><strong>{summary.active}</strong><small>Active applications</small></div>
          </article>
          <article>
            <span><AppIcon name="calendar" size={20} /></span>
            <div><strong>{summary.actions_due}</strong><small>Actions due</small></div>
          </article>
          <article>
            <span><AppIcon name="users" size={20} /></span>
            <div><strong>{summary.interviews}</strong><small>Interview stage</small></div>
          </article>
          <article className="summary-offer">
            <span><AppIcon name="spark" size={20} /></span>
            <div><strong>{summary.offers}</strong><small>Offers</small></div>
          </article>
        </section>

        <PortalHub onTrackJob={openApplicationDialog} />

        <section className="pipeline-section" id="pipeline">
          <div className="pipeline-heading">
            <div>
              <p className="eyebrow">My application tracker</p>
              <h2>Pipeline</h2>
              <p>{applications.length} saved roles · visible only to you</p>
            </div>
            <label className="pipeline-search">
              <AppIcon name="search" size={18} />
              <span className="sr-only">Search applications</span>
              <input
                placeholder="Search company or role"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          {dashboard.status === 'loading' && !data ? (
            <div className="loading-panel" role="status">
              Loading your private PostgreSQL records…
            </div>
          ) : (
            <div className="pipeline-board">
              {pipelineStatuses.map((status) => {
                const items = filteredApplications.filter(
                  (application) => application.status === status,
                )

                return (
                  <section className={`pipeline-column pipeline-column--${status}`} key={status}>
                    <div className="pipeline-column__heading">
                      <span />
                      <h3>{statusLabels[status]}</h3>
                      <strong>{items.length}</strong>
                    </div>
                    <div className="pipeline-cards">
                      {items.map((application) => (
                        <ApplicationCard
                          application={application}
                          key={application.id}
                          onStatusChange={changeStatus}
                        />
                      ))}
                      {items.length === 0 && (
                        <p className="empty-column">No roles in this stage</p>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          <p className="archive-note">
            {applications.filter((item) =>
              item.status === 'rejected' || item.status === 'withdrawn',
            ).length}{' '}
            archived applications are kept out of your active pipeline.
          </p>
        </section>

        <section className="interview-section" id="interviews">
          <div className="interview-copy">
            <p className="eyebrow">Upcoming conversations</p>
            <h2>Interview calendar</h2>
            <p>
              Keep the company, interview format, meeting link and preparation
              notes connected to the right application.
            </p>
          </div>
          <div className="interview-list">
            {(data?.upcoming_interviews ?? []).map((interview) => (
              <article key={interview.id}>
                <time>
                  <strong>
                    {new Intl.DateTimeFormat('en', {
                      day: '2-digit',
                      month: 'short',
                    }).format(new Date(interview.starts_at))}
                  </strong>
                  <span>
                    {new Intl.DateTimeFormat('en', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(interview.starts_at))}
                  </span>
                </time>
                <div>
                  <p>{interview.company}</p>
                  <h3>{interview.title}</h3>
                  <small>
                    {interview.interview_type} · {interview.duration_minutes} minutes
                  </small>
                </div>
                {interview.meeting_url && (
                  <a href={interview.meeting_url} rel="noreferrer" target="_blank">
                    Open meeting <AppIcon name="external" size={15} />
                  </a>
                )}
              </article>
            ))}
            {(data?.upcoming_interviews ?? []).length === 0 && (
              <p className="empty-interviews">No upcoming interviews yet.</p>
            )}
          </div>
        </section>

        <section className="optional-integration-section">
          <details>
            <summary>
              <span><AppIcon name="mail" size={19} /></span>
              <div>
                <strong>Optional Gmail application import</strong>
                <small>Advanced setup · read-only access · review before saving</small>
              </div>
              <AppIcon name="chevron" size={18} />
            </summary>
            <EmailImportCenter onPipelineChanged={dashboard.refresh} />
          </details>
        </section>
      </main>

      {dialogOpen && (
        <AddApplicationDialog
          initialSourceId={dialogSourceId}
          sources={sources}
          onClose={closeApplicationDialog}
          onSubmit={addApplication}
        />
      )}

      {profileOpen && (
        <ProfileDrawer
          sourceCount={new Set(
            applications
              .map((application) => application.source?.id)
              .filter((sourceId): sourceId is number => sourceId !== undefined),
          ).size}
          summary={summary}
          user={user}
          onClose={() => setProfileOpen(false)}
          onSignOut={logout}
        />
      )}
    </div>
  )
}
