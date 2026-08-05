export type UserRole = 'member' | 'admin'
export type LoginPortal = 'member' | 'admin'
export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'
export type LoadStatus = 'loading' | 'ready' | 'error'
export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'
export type EmailImportState = 'pending' | 'imported' | 'ignored'
export type MailboxStatus = 'active' | 'needs_reconnect' | 'disconnected'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  active: boolean
  headline: string | null
  location: string | null
}

export interface AdminMember extends User {
  application_count: number
  interview_count: number
}

export interface JobSource {
  id: number
  name: string
  home_url: string
  search_url: string
  accent: string
  active: boolean
  remote_focused: boolean
}

export interface Interview {
  id: number
  starts_at: string
  interview_type: 'phone' | 'video' | 'onsite' | 'technical'
  duration_minutes: number
  contact_name: string | null
  meeting_url: string | null
  notes: string | null
  company?: string
  title?: string
}

export interface JobApplication {
  id: number
  company: string
  title: string
  location: string | null
  employment_type: string | null
  job_url: string
  status: ApplicationStatus
  notes: string | null
  applied_on: string | null
  next_action_on: string | null
  salary_note: string | null
  remote: boolean
  source: JobSource | null
  interviews: Interview[]
  created_at: string
}

export interface MemberDashboard {
  viewer: User
  summary: {
    total: number
    active: number
    applied: number
    interviews: number
    offers: number
    actions_due: number
  }
  status_counts: Record<ApplicationStatus, number>
  sources: JobSource[]
  applications: JobApplication[]
  upcoming_interviews: Interview[]
}

export interface AdminDashboard {
  viewer: User
  summary: {
    members: number
    active_members: number
    applications: number
    interviews: number
    offers: number
    sources: number
  }
  status_counts: Record<ApplicationStatus, number>
  members: AdminMember[]
  sources: JobSource[]
}

export interface NewApplicationInput {
  job_source_id: number | null
  company: string
  title: string
  location: string
  employment_type: string
  job_url: string
  status: ApplicationStatus
  notes: string
  next_action_on: string
  remote: boolean
}

export interface RegistrationInput {
  name: string
  email: string
  password: string
  password_confirmation: string
  headline: string
  location: string
}

export interface MailboxConnection {
  id: number
  provider: 'gmail'
  email: string
  status: MailboxStatus
  demo: boolean
  connected_at: string | null
  last_synced_at: string | null
  last_error: string | null
  pending_count: number
}

export interface EmailImport {
  id: number
  sender: string | null
  subject: string
  received_at: string
  company: string
  title: string
  job_url: string
  source_name: string | null
  inferred_status: ApplicationStatus
  confidence: number
  snippet: string | null
  state: EmailImportState
  imported_application_id: number | null
}

export interface EmailImportCenterData {
  gmail_configured: boolean
  connection: MailboxConnection | null
  imports: EmailImport[]
}

export interface ConfirmEmailImportInput {
  company: string
  title: string
  job_url: string
  source_name: string
  status: ApplicationStatus
}

export interface JobPortalProfile {
  id: number
  job_source_id: number
  account_label: string | null
  profile_url: string | null
  applications_url: string | null
  launch_url: string
  last_opened_at: string | null
}

export interface JobPortalEntry {
  source: JobSource
  profile: JobPortalProfile | null
  application_count: number
  status_counts: Record<ApplicationStatus, number>
}

export interface JobPortalHubData {
  portals: JobPortalEntry[]
}

export interface JobPortalProfileInput {
  job_source_id: number
  account_label: string
  profile_url: string
  applications_url: string
}
