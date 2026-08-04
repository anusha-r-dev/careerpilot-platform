import { useMemo, useState } from 'react'
import { usePortalProfiles } from '../hooks/usePortalProfiles'
import type { JobPortalEntry } from '../types'
import { AppIcon } from './AppIcon'
import { PortalProfileDialog } from './PortalProfileDialog'

interface PortalHubProps {
  onTrackJob: (sourceId: number) => void
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formattedVisit(value: string | null) {
  if (!value) return 'Not opened from CareerPilot yet'

  return `Opened ${new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))}`
}

export function PortalHub({ onTrackJob }: PortalHubProps) {
  const hub = usePortalProfiles()
  const portals = useMemo(() => hub.data?.portals ?? [], [hub.data?.portals])
  const [editingPortal, setEditingPortal] = useState<JobPortalEntry | null>(null)
  const connectedCount = portals.filter((portal) => portal.profile).length
  const generalPortals = portals.filter((portal) => !portal.source.remote_focused)
  const remotePortals = portals.filter((portal) => portal.source.remote_focused)
  const trackedCount = portals.reduce(
    (total, portal) => total + portal.application_count,
    0,
  )

  const renderPortalCard = (portal: JobPortalEntry) => {
    const profile = portal.profile
    const destination = profile?.launch_url ?? portal.source.search_url

    return (
      <article
        className={`portal-card portal-card--${portal.source.accent}`}
        key={portal.source.id}
      >
        <div className="portal-card__topline">
          <span className="portal-card__logo" aria-hidden="true">
            {initials(portal.source.name)}
          </span>
          <span className={profile ? 'portal-linked' : 'portal-unlinked'}>
            {profile ? 'Linked' : 'Not linked'}
          </span>
        </div>

        <div className="portal-card__title">
          <div>
            <h3>{portal.source.name}</h3>
            <p>{profile?.account_label ?? 'Add your personal shortcut'}</p>
          </div>
          <strong>{portal.application_count}</strong>
        </div>

        <div className="portal-stage-counts">
          <span><strong>{portal.status_counts.saved}</strong>Saved</span>
          <span><strong>{portal.status_counts.applied}</strong>Applied</span>
          <span><strong>{portal.status_counts.interview}</strong>Interview</span>
        </div>

        <p className="portal-last-opened">
          {profile
            ? formattedVisit(profile.last_opened_at)
            : 'Link your profile or applications page for faster access'}
        </p>

        <div className="portal-card__actions">
          <a
            className="portal-open-link"
            href={destination}
            rel="noreferrer"
            target="_blank"
            onClick={() => {
              if (profile) void hub.markOpened(profile.id)
            }}
          >
            {profile ? 'Open applications' : 'Search jobs'}
            <AppIcon name="external" size={15} />
          </a>
          <button type="button" onClick={() => onTrackJob(portal.source.id)}>
            <AppIcon name="plus" size={15} />
            Track a job
          </button>
        </div>

        <button
          className="portal-manage-button"
          type="button"
          onClick={() => setEditingPortal(portal)}
        >
          {profile ? 'Manage portal links' : 'Link my portal'}
        </button>
      </article>
    )
  }

  return (
    <section className="portal-hub" id="portals">
      <div className="portal-hub__heading">
        <div>
          <p className="eyebrow">Your job search launchpad</p>
          <h2>Job portal hub</h2>
          <p>
            Keep official portal shortcuts together, open your saved or applied
            jobs, and track selected opportunities in one private pipeline.
          </p>
        </div>
        <div className="portal-privacy-badge">
          <AppIcon name="shield" size={18} />
          <span><strong>Passwords stay private</strong>Sign in only on the official website</span>
        </div>
      </div>

      <div className="portal-hub__summary" aria-label="Portal summary">
        <article>
          <strong>{connectedCount.toString().padStart(2, '0')}</strong>
          <span>Portal shortcuts linked</span>
        </article>
        <article>
          <strong>{trackedCount.toString().padStart(2, '0')}</strong>
          <span>Applications tracked from portals</span>
        </article>
        <p>
          CareerPilot stores your links and tracker records. It does not scrape job
          websites or access third-party sessions.
        </p>
      </div>

      {hub.error && <p className="portal-hub__error" role="alert">{hub.error}</p>}

      {hub.status === 'loading' && !hub.data ? (
        <div className="loading-panel" role="status">
          Loading your private portal shortcuts…
        </div>
      ) : (
        <div className="portal-collections">
          <section className="portal-collection" aria-labelledby="general-portals-title">
            <div className="portal-collection__heading">
              <div>
                <p className="eyebrow">Everyday search</p>
                <h3 id="general-portals-title">General job portals</h3>
              </div>
              <span>{generalPortals.length} sources</span>
            </div>
            <div className="portal-card-grid">
              {generalPortals.map(renderPortalCard)}
            </div>
          </section>

          <section className="portal-collection" aria-labelledby="remote-portals-title">
            <div className="portal-collection__heading">
              <div>
                <p className="eyebrow">Work from anywhere</p>
                <h3 id="remote-portals-title">Remote job boards</h3>
              </div>
              <span>{remotePortals.length} remote-first sources</span>
            </div>
            <div className="portal-card-grid">
              {remotePortals.map(renderPortalCard)}
            </div>
          </section>
        </div>
      )}

      {editingPortal && (
        <PortalProfileDialog
          busy={hub.busyAction !== null}
          portal={editingPortal}
          onClose={() => setEditingPortal(null)}
          onDisconnect={hub.disconnect}
          onSave={hub.save}
        />
      )}
    </section>
  )
}
