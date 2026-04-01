import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/auth/LoginForm'
import birdLogo  from '../assets/bird.png'
import birdLogoD from '../assets/bird_black.png'

export default function Login() {
  const { theme } = useTheme()
  const { login, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Already logged in → redirect away
  if (isAuthenticated) {
    const dest = location.state?.from?.pathname ?? '/home'
    navigate(dest, { replace: true })
    return null
  }

  async function handleLogin(email, password) {
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      const dest = location.state?.from?.pathname ?? '/home'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh', backgroundColor: theme.background,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {/* <Link to="/">
            <img
              src={theme.themeType === 'dark' ? birdLogo : birdLogoD}
              alt="SNIIPE" style={{ height: '56px', marginBottom: '16px' }}
            />
          </Link> */}
          <h1 className="font-heading" style={{
            fontSize: '2.2rem', fontWeight: 900, color: theme.textPrimary,
            letterSpacing: '-0.01em', marginBottom: '6px',
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>
            Sign in to your SNIIPE account
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '20px', padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        </div>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <Link to="/" style={{
            color: theme.textMuted, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
            onMouseEnter={e => e.currentTarget.style.color = theme.textSecondary}
            onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }} />
            Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}
