import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../theme/ThemeContext'

/**
 * AuthGuard — wraps any route that requires login.
 *
 * While session is being restored → shows a full-page spinner.
 * Not authenticated            → redirects to /login (preserving intended URL).
 * Authenticated                → renders children.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: theme.background,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: `3px solid ${theme.border}`, borderTopColor: theme.primary,
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: theme.textMuted, fontSize: '13px' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
