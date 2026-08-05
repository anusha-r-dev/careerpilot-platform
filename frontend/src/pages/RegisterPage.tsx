import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { AppIcon } from '../components/AppIcon'
import { Brand } from '../components/Brand'

export function RegisterPage({
  onNavigate,
}: {
  onNavigate: (path: string) => void
}) {
  const auth = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await auth.register({
        name,
        email,
        headline,
        location,
        password,
        password_confirmation: confirmation,
      })
      onNavigate('/app')
    } catch {
      // The authentication context presents the safe API error.
    }
  }

  return (
    <main className="register-page">
      <section className="register-intro">
        <a href="/" aria-label="CareerPilot home">
          <Brand />
        </a>
        <div>
          <p className="eyebrow">Your account, your data</p>
          <h1>Build a job search system that works for you.</h1>
          <p>
            Create a private workspace in under a minute. Every registered
            user receives an independent account.
          </p>
        </div>
        <p className="registration-note">
          <AppIcon name="shield" size={18} />
          Public registration can create member accounts only.
        </p>
      </section>

      <section className="register-form-panel">
        <button className="back-link" type="button" onClick={() => onNavigate('/')}>
          ← Back to CareerPilot
        </button>
        <div className="register-form-wrap">
          <p className="eyebrow">Create a private workspace</p>
          <h2>Start tracking applications</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                <span>Full name</span>
                <input required value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label>
                <span>Email address</span>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
            </div>
            <div className="form-grid">
              <label>
                <span>Current role or goal</span>
                <input placeholder="Software Developer" value={headline} onChange={(event) => setHeadline(event.target.value)} />
              </label>
              <label>
                <span>Location</span>
                <input placeholder="Bengaluru, India" value={location} onChange={(event) => setLocation(event.target.value)} />
              </label>
            </div>
            <div className="form-grid">
              <label>
                <span>Password</span>
                <input minLength={10} required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              <label>
                <span>Confirm password</span>
                <input minLength={10} required type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
              </label>
            </div>

            {auth.error && (
              <p className="form-error" role="alert">
                {auth.error}
              </p>
            )}

            <button className="button button--dark register-button" type="submit">
              Create my account
              <AppIcon name="arrow" size={18} />
            </button>
          </form>

          <p className="form-switch">
            Already registered?{' '}
            <button type="button" onClick={() => onNavigate('/login')}>
              Sign in
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}
