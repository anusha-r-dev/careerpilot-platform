import type { ApplicationStatus } from '../types'

export const statusLabels: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const pipelineStatuses: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
]
