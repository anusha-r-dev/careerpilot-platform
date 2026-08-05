import { useEffect, useId, useState, type FormEvent } from 'react'
import type {
  ApplicationStatus,
  JobSource,
  NewApplicationInput,
} from '../types'
import { AppIcon } from './AppIcon'

interface AddApplicationDialogProps {
  sources: JobSource[]
  initialSourceId?: number | null
  onClose: () => void
  onSubmit: (input: NewApplicationInput) => Promise<void>
}

export function AddApplicationDialog({
  sources,
  initialSourceId,
  onClose,
  onSubmit,
}: AddApplicationDialogProps) {
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [sourceId, setSourceId] = useState(
    initialSourceId?.toString() ?? sources[0]?.id.toString() ?? '',
  )
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [status, setStatus] = useState<ApplicationStatus>('saved')
  const [notes, setNotes] = useState('')
  const [nextActionOn, setNextActionOn] = useState('')
  const [remote, setRemote] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await onSubmit({
        job_source_id: sourceId ? Number(sourceId) : null,
        company: company.trim(),
        title: title.trim(),
        location: location.trim(),
        employment_type: employmentType,
        job_url: jobUrl.trim(),
        status,
        notes: notes.trim(),
        next_action_on: nextActionOn,
        remote,
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The job could not be saved.',
      )
      setSaving(false)
    }
  }

  return (
    <div className="dialog-layer" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="add-job-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Add from any website</p>
            <h2 id={titleId}>Save a job to CareerPilot</h2>
          </div>
          <button aria-label="Close form" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Company</span>
              <input
                autoFocus
                required
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </label>
            <label>
              <span>Role title</span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Original job URL</span>
            <div className="input-with-icon">
              <AppIcon name="link" size={17} />
              <input
                placeholder="https://company.com/careers/role"
                required
                type="url"
                value={jobUrl}
                onChange={(event) => setJobUrl(event.target.value)}
              />
            </div>
          </label>

          <div className="form-grid form-grid--three">
            <label>
              <span>Source</span>
              <select
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
              >
                <option value="">Company careers</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ApplicationStatus)
                }
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
              </select>
            </label>
            <label>
              <span>Next action</span>
              <input
                type="date"
                value={nextActionOn}
                onChange={(event) => setNextActionOn(event.target.value)}
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              <span>Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </label>
            <label>
              <span>Employment type</span>
              <select
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>
          </div>

          <label>
            <span>Notes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          <label className="checkbox-label">
            <input
              checked={remote}
              type="checkbox"
              onChange={(event) => setRemote(event.target.checked)}
            />
            <span>This role supports remote work</span>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="dialog-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="button button--primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save job'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
