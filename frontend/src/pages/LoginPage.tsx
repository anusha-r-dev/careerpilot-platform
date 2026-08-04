import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { AppIcon } from '../components/AppIcon'
import { Brand } from '../components/Brand'
import type { LoginPortal } from '../types'

interface LoginPageProps {
  portal: LoginPortal
  onNavigate: (path: string) => void
}

const content = {
  member: {
    eyebrow: 'Member sign in',
    title: 'Welcome back to your search.',
    description:
      'Open your private pipeline and continue exactly where you left off.',
    email: 'anusha@careerpilot.demo',
    destination: '/app',
  },
  admin: {
    eyebrow: 'Administrator access',
    title: 'Manage the CareerPilot platform.',
    description:
      'Review member accounts, trusted job sources and privacy-safe activity.',
    email: 'admin@careerpilot.demo',
    destination: '/admin',
  },
} as const

export function LoginPage({ portal, onNavigate }: LoginPageProps) {
  const auth = useAuth()
  const page = content[portal]
  const [email, setEmail] = useState<string>(page.email)
  const [password, setPassword] = useState('CareerPilotDemo123!')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await auth.login(email, password, portal)
      onNavigate(page.destination)
    } catch {
      // The authentication context presents the safe API error.
    }
  }

  return (
    <main className={`login-page login-page--${portal}`}>
      <section className="login-form-panel">
        <button
          className="back-link"
          type="button"
          onClick={() => {
            auth.clearError()
            onNavigate('/')
          }}
        >
          ← Back to CareerPilot
        </button>

        <div className="login-form-wrap">
          <a href="/" aria-label="CareerPilot home">
            <Brand dark />
          </a>
          <div className="login-heading">
            <p className="eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              <span>Email address</span>
              <input
                autoComplete="email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                autoComplete="current-password"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {auth.error && (
              <p className="form-error" role="alert">
                {auth.error}
              </p>
            )}

            <button className="button button--dark login-button" type="submit">
              Sign in
              <AppIcon name="arrow" size={18} />
            </button>
          </form>

          <div className="demo-box">
            <strong>Demo credentials</strong>
            <span>{page.email}</span>
            <span>CareerPilotDemo123!</span>
          </div>

          {portal === 'member' ? (
            <p className="form-switch">
              New to CareerPilot?{' '}
              <button type="button" onClick={() => onNavigate('/register')}>
                Create your private account
              </button>
            </p>
          ) : (
            <p className="form-switch">
              Looking for your applications?{' '}
              <button type="button" onClick={() => onNavigate('/login')}>
                Member sign in
              </button>
            </p>
          )}
        </div>
      </section>

      <aside className="login-art">
        <div>
          <p className="eyebrow">
            {portal === 'member' ? 'One calm workspace' : 'Privacy-aware control'}
          </p>
          <h2>
            {portal === 'member'
              ? 'Your next opportunity should never get lost.'
              : 'Support every account without reading private job notes.'}
          </h2>
          <ul>
            {(portal === 'member'
              ? [
                  'Save roles from any job website',
                  'Track applications in a visual pipeline',
                  'Keep interview details and next actions together',
                ]
              : [
                  'Activate and suspend member accounts',
                  'Maintain approved job-source shortcuts',
                  'See aggregate usage without private applications',
                ]
            ).map((item) => (
              <li key={item}>
                <AppIcon name="check" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  )
}
