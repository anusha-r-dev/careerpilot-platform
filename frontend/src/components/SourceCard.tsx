import type { JobSource } from '../types'
import { AppIcon } from './AppIcon'

export function SourceCard({ source }: { source: JobSource }) {
  return (
    <a
      className={`source-card source-card--${source.accent}`}
      href={source.search_url}
      rel="noreferrer"
      target="_blank"
    >
      <span className="source-card__mark" aria-hidden="true">
        {source.name.slice(0, 2).toUpperCase()}
      </span>
      <span>
        <strong>{source.name}</strong>
        <small>Search current jobs</small>
      </span>
      <AppIcon name="external" size={17} />
    </a>
  )
}
