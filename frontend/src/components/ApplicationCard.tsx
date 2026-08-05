import type {
  ApplicationStatus,
  JobApplication,
} from '../types'
import { statusLabels } from '../constants/applications'
import { AppIcon } from './AppIcon'

interface ApplicationCardProps {
  application: JobApplication
  onStatusChange: (id: number, status: ApplicationStatus) => void
}

export function ApplicationCard({
  application,
  onStatusChange,
}: ApplicationCardProps) {
  const initials = application.company.slice(0, 2).toUpperCase()

  return (
    <article className="application-card">
      <div className="application-card__company">
        <span aria-hidden="true">{initials}</span>
        <div>
          <p>{application.company}</p>
          <small>{application.source?.name ?? 'Company careers'}</small>
        </div>
        <a
          aria-label={`Open ${application.title} listing`}
          href={application.job_url}
          rel="noreferrer"
          target="_blank"
        >
          <AppIcon name="external" size={16} />
        </a>
      </div>

      <h3>{application.title}</h3>
      <p className="application-card__meta">
        {application.remote ? 'Remote' : application.location || 'Location not set'}
        {application.employment_type && ` · ${application.employment_type}`}
      </p>

      {application.next_action_on && (
        <p className="application-card__date">
          <AppIcon name="calendar" size={14} />
          Next action {application.next_action_on}
        </p>
      )}

      <label>
        <span>Move to</span>
        <select
          value={application.status}
          onChange={(event) =>
            onStatusChange(
              application.id,
              event.target.value as ApplicationStatus,
            )
          }
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}
