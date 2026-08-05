import { useEffect, useId, useState, type FormEvent } from 'react'
import type { JobPortalEntry, JobPortalProfileInput } from '../types'
import { AppIcon } from './AppIcon'

interface PortalProfileDialogProps {
  busy: boolean
  portal: JobPortalEntry
  onClose: () => void
  onDisconnect: (profileId: number) => Promise<void>
  onSave: (
    profileId: number | null,
    input: JobPortalProfileInput,
  ) => Promise<void>
}

export function PortalProfileDialog({
  busy,
  portal,
  onClose,
  onDisconnect,
  onSave,
}: PortalProfileDialogProps) {
  const profile = portal.profile
  const [accountLabel, setAccountLabel] = useState(profile?.account_label ?? '')
  const [profileUrl, setProfileUrl] = useState(profile?.profile_url ?? '')
  const [applicationsUrl, setApplicationsUrl] = useState(
    profile?.applications_url ?? '',
  )
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!profileUrl.trim() && !applicationsUrl.trim()) {
      setError('Add your profile URL or your applications-page URL.')
      return
    }

    try {
      await onSave(profile?.id ?? null, {
        job_source_id: portal.source.id,
        account_label: accountLabel.trim(),
        profile_url: profileUrl.trim(),
        applications_url: applicationsUrl.trim(),
      })
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This portal could not be linked.',
      )
    }
  }

  async function handleDisconnect() {
    if (!profile) return

    try {
      await onDisconnect(profile.id)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This portal could not be disconnected.',
      )
    }
  }

  return (
    <div className="dialog-layer" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="portal-profile-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Private portal shortcut</p>
            <h2 id={titleId}>Link {portal.source.name}</h2>
          </div>
          <button aria-label="Close form" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="portal-dialog-safety">
          <AppIcon name="lock" size={18} />
          <p>
            Add links only. Sign in on {portal.source.name} itself—CareerPilot never
            asks for or stores your portal password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Account label <small>Optional</small></span>
            <input
              autoFocus
              maxLength={80}
              placeholder="My professional account"
              value={accountLabel}
              onChange={(event) => setAccountLabel(event.target.value)}
            />
          </label>

          <label>
            <span>Profile URL</span>
            <div className="input-with-icon">
              <AppIcon name="link" size={17} />
              <input
                placeholder={portal.source.home_url}
                type="url"
                value={profileUrl}
                onChange={(event) => setProfileUrl(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Saved or applied jobs page URL</span>
            <div className="input-with-icon">
              <AppIcon name="briefcase" size={17} />
              <input
                placeholder={`${portal.source.home_url}my-applications`}
                type="url"
                value={applicationsUrl}
                onChange={(event) => setApplicationsUrl(event.target.value)}
              />
            </div>
          </label>

          <p className="portal-dialog-help">
            Open the portal, navigate to its Saved jobs or Applications page,
            then copy that page URL here.
          </p>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="portal-dialog-actions">
            {profile ? (
              <button
                className="portal-disconnect-button"
                disabled={busy}
                type="button"
                onClick={() => void handleDisconnect()}
              >
                Remove shortcut
              </button>
            ) : <span />}
            <div>
              <button disabled={busy} type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="button button--primary" disabled={busy} type="submit">
                {busy ? 'Saving…' : 'Save portal'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
