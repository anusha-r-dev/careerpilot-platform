import './App.css'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import { useNavigation } from './hooks/useNavigation'
import { AdminAppPage } from './pages/AdminAppPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { MemberAppPage } from './pages/MemberAppPage'
import { RegisterPage } from './pages/RegisterPage'
import { AccessDeniedPage, LoadingPage } from './pages/SystemPages'
import type { LoginPortal, UserRole } from './types'

function destinationFor(role: UserRole) {
  return role === 'admin' ? '/admin' : '/app'
}

function AppRoutes() {
  const auth = useAuth()
  const { pathname, navigate } = useNavigation()

  if (auth.status === 'loading') {
    return <LoadingPage />
  }

  if (pathname === '/') {
    return <LandingPage onNavigate={navigate} />
  }

  if (pathname === '/login' || pathname === '/admin/login') {
    const portal: LoginPortal = pathname === '/admin/login' ? 'admin' : 'member'

    if (auth.user) {
      return (
        <main className="system-page">
          <span className="system-logo">✓</span>
          <p className="eyebrow">Session active</p>
          <h1>You are already signed in.</h1>
          <p>Continue to the private workspace connected to this account.</p>
          <button
            className="button button--dark"
            type="button"
            onClick={() => navigate(destinationFor(auth.user!.role))}
          >
            Open my workspace
          </button>
        </main>
      )
    }

    return <LoginPage key={portal} portal={portal} onNavigate={navigate} />
  }

  if (pathname === '/register') {
    if (auth.user) {
      return (
        <main className="system-page">
          <span className="system-logo">HF</span>
          <h1>Your account is ready.</h1>
          <button
            className="button button--dark"
            type="button"
            onClick={() => navigate(destinationFor(auth.user!.role))}
          >
            Open my workspace
          </button>
        </main>
      )
    }

    return <RegisterPage onNavigate={navigate} />
  }

  if (pathname === '/app' || pathname === '/admin') {
    const requiredRole: UserRole = pathname === '/admin' ? 'admin' : 'member'

    if (!auth.user) {
      return (
        <LoginPage
          key={requiredRole}
          portal={requiredRole}
          onNavigate={navigate}
        />
      )
    }

    if (auth.user.role !== requiredRole) {
      return (
        <AccessDeniedPage
          onLogout={() => {
            void auth.logout().finally(() => navigate('/'))
          }}
        />
      )
    }

    return requiredRole === 'admin' ? (
      <AdminAppPage onNavigate={navigate} />
    ) : (
      <MemberAppPage onNavigate={navigate} />
    )
  }

  return (
    <main className="system-page">
      <span className="system-logo">404</span>
      <p className="eyebrow">Page not found</p>
      <h1>This CareerPilot page does not exist.</h1>
      <button className="button button--dark" type="button" onClick={() => navigate('/')}>
        Return home
      </button>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
