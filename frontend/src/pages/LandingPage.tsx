import { AppIcon } from '../components/AppIcon'
import { Brand } from '../components/Brand'

interface LandingPageProps {
  onNavigate: (path: string) => void
}

const sourceNames = [
  'LinkedIn',
  'Indeed',
  'Naukri',
  'Wellfound',
  'Glassdoor',
  'Remote OK',
  'We Work Remotely',
  'Remotive',
  'Remote.co',
  'Working Nomads',
  'Himalayas',
  'FlexJobs',
]

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <a href="/" aria-label="CareerPilot home">
          <Brand dark />
        </a>
        <nav aria-label="Public navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#privacy">Privacy</a>
          <button type="button" onClick={() => onNavigate('/admin/login')}>
            Admin
          </button>
        </nav>
        <div>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => onNavigate('/login')}
          >
            Sign in
          </button>
          <button
            className="button button--dark"
            type="button"
            onClick={() => onNavigate('/register')}
          >
            Create account
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <p className="eyebrow">Your private job search hub</p>
            <h1>
              Every application.
              <br />
              <em>One clear path.</em>
            </h1>
            <p>
              Discover opportunities across the web, save any job link and
              track every next step without losing another application in a
              spreadsheet.
            </p>
            <div className="hero-actions">
              <button
                className="button button--dark button--large"
                type="button"
                onClick={() => onNavigate('/register')}
              >
                Start tracking for free
                <AppIcon name="arrow" size={18} />
              </button>
              <button
                className="text-link"
                type="button"
                onClick={() => onNavigate('/login')}
              >
                Try the demo account
              </button>
            </div>
            <p className="hero-proof">
              <AppIcon name="shield" size={18} />
              Every account gets a separate private workspace.
            </p>
          </div>

          <div className="hero-product" aria-label="Application pipeline preview">
            <div className="hero-product__top">
              <span>My pipeline</span>
              <span>4 active</span>
            </div>
            <div className="preview-columns">
              <div>
                <p>Saved</p>
                <article>
                  <span>AT</span>
                  <strong>Frontend Engineer</strong>
                  <small>Atlassian · Remote</small>
                </article>
              </div>
              <div>
                <p>Interview</p>
                <article className="preview-card--featured">
                  <span>CA</span>
                  <strong>Full Stack Engineer</strong>
                  <small>Canva · Tomorrow 4 PM</small>
                </article>
              </div>
              <div>
                <p>Offer</p>
                <article>
                  <span>PO</span>
                  <strong>Product Engineer</strong>
                  <small>Postman · Final call</small>
                </article>
              </div>
            </div>
            <div className="preview-floating-card">
              <AppIcon name="spark" size={19} />
              <span>
                <strong>Next action ready</strong>
                <small>Prepare the portfolio walkthrough</small>
              </span>
            </div>
          </div>
        </section>

        <section className="source-marquee" aria-label="Supported job sources">
          <p>Search on the sites you already use</p>
          <div>
            {sourceNames.map((source) => (
              <span key={source}>{source}</span>
            ))}
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div>
            <p className="eyebrow">A simpler workflow</p>
            <h2>From discovery to offer, without the chaos.</h2>
          </div>
          <div className="how-grid">
            <article>
              <span>01</span>
              <AppIcon name="search" size={25} />
              <h3>Discover anywhere</h3>
              <p>
                Open trusted job sites from CareerPilot or find a role on any
                company careers page.
              </p>
            </article>
            <article>
              <span>02</span>
              <AppIcon name="link" size={25} />
              <h3>Save the original link</h3>
              <p>
                Store the role, company, source and next action in your private
                workspace.
              </p>
            </article>
            <article>
              <span>03</span>
              <AppIcon name="briefcase" size={25} />
              <h3>Move through the pipeline</h3>
              <p>
                Track Saved, Applied, Interview and Offer stages while keeping
                the original listing one click away.
              </p>
            </article>
          </div>
        </section>

        <section className="privacy-section" id="privacy">
          <div className="privacy-graphic" aria-hidden="true">
            <span><AppIcon name="shield" size={34} /></span>
            <i />
            <i />
          </div>
          <div>
            <p className="eyebrow">Designed for job seekers, private by default</p>
            <h2>Your job search belongs to you.</h2>
            <p>
              Each user sees only their own saved roles and application
              details. Administrators can manage accounts and job sources, but
              the overview intentionally exposes only aggregate activity.
            </p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Brand dark />
        <p>Portfolio demonstration · External listings remain on their original sites.</p>
      </footer>
    </div>
  )
}
