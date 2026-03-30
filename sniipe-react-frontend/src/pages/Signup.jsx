import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import SignupForm from '../components/auth/SignupForm'
import birdLogo  from '../assets/bird.png'
import birdLogoD from '../assets/bird_black.png'

export default function Signup() {
  const { theme } = useTheme()
  const { signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  if (isAuthenticated) {
    navigate('/home', { replace: true })
    return null
  }

  async function handleSignup(formData) {
    setLoading(true)
    setError('')
    try {
      await signup(formData)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: theme.background,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/">
            <img
              src={theme.themeType === 'dark' ? birdLogo : birdLogoD}
              alt="SNIIPE" style={{ height: '56px', marginBottom: '16px' }}
            />
          </Link>
          <h1 className="font-heading" style={{
            fontSize: '2.2rem', fontWeight: 900, color: theme.textPrimary,
            letterSpacing: '-0.01em', marginBottom: '6px',
          }}>
            Create account
          </h1>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>
            Join SNIIPE and unlock exclusive drops
          </p>
        </div>

        {success ? (
          <div style={{
            backgroundColor: theme.surface,
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '20px', padding: '40px 32px', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <i className="fa-solid fa-check" style={{ fontSize: '24px', color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '8px' }}>
              Account created!
            </h2>
            <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '8px' }}>
              Please check your email to verify your account.
            </p>
            <p style={{ color: theme.textMuted, fontSize: '13px' }}>Redirecting to login…</p>
          </div>
        ) : (
          <div style={{
            backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '20px', padding: '36px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <SignupForm onSubmit={handleSignup} loading={loading} error={error} />
          </div>
        )}

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
