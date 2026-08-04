import { useState } from 'react'
import { statusLabels } from '../constants/applications'
import type {
  ApplicationStatus,
  ConfirmEmailImportInput,
  EmailImport,
} from '../types'
import { AppIcon } from './AppIcon'

interface EmailImportCardProps {
  emailImport: EmailImport
  busy: boolean
  onConfirm: (id: number, input: ConfirmEmailImportInput) => Promise<void>
  onIgnore: (id: number) => void
}

const importStatuses: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
]

export function EmailImportCard({
  emailImport,
  busy,
  onConfirm,
  onIgnore,
}: EmailImportCardProps) {
  const [form, setForm] = useState<ConfirmEmailImportInput>({
    company: emailImport.company,
    title: emailImport.title,
    job_url: emailImport.job_url,
    source_name: emailImport.source_name ?? 'Company careers',
    status: emailImport.inferred_status,
  })

  function update<K extends keyof ConfirmEmailImportInput>(
    key: K,
    value: ConfirmEmailImportInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <article className="email-import-card">
      <div className="email-import-card__message">
        <div className="email-import-card__meta">
          <span className="email-provider-icon">
            <AppIcon name="mail" size={19} />
          </span>
          <div>
            <strong>{emailImport.subject}</strong>
            <small>
              {emailImport.sender ?? 'Recruiting sender'} ·{' '}
              {new Intl.DateTimeFormat('en', {
                day: '2-digit',
                month: 'short',
              }).format(new Date(emailImport.received_at))}
            </small>
          </div>
          <span className={`confidence confidence--${emailImport.confidence >= 85 ? 'high' : 'review'}`}>
            {emailImport.confidence}% match
          </span>
        </div>
        {emailImport.snippet && <p>{emailImport.snippet}</p>}
      </div>

      <form
        className="email-import-card__form"
        onSubmit={(event) => {
          event.preventDefault()
          void onConfirm(emailImport.id, form).catch(() => undefined)
        }}
      >
        <div className="email-import-fields">
          <label>
            <span>Company</span>
            <input
              required
              value={form.company}
              onChange={(event) => update('company', event.target.value)}
            />
          </label>
          <label>
            <span>Role</span>
            <input
              required
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
            />
          </label>
          <label>
            <span>Source</span>
            <input
              value={form.source_name}
              onChange={(event) => update('source_name', event.target.value)}
            />
          </label>
          <label>
            <span>Pipeline stage</span>
            <select
              value={form.status}
              onChange={(event) =>
                update('status', event.target.value as ApplicationStatus)
              }
            >
              {importStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="email-import-url">
            <span>Original job or email link</span>
            <input
              required
              type="url"
              value={form.job_url}
              onChange={(event) => update('job_url', event.target.value)}
            />
          </label>
        </div>
        <div className="email-import-actions">
          <button
            className="button button--ghost"
            disabled={busy}
            type="button"
            onClick={() => onIgnore(emailImport.id)}
          >
            Not a job email
          </button>
          <button className="button button--dark" disabled={busy} type="submit">
            <AppIcon name="check" size={17} />
            {busy ? 'Saving…' : 'Confirm and add to pipeline'}
          </button>
        </div>
      </form>
    </article>
  )
}
