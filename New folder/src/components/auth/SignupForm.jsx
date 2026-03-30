import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'
import { isValidEmail, isValidPassword } from '../../utils/authUtils'
import { AuthField, BtnSpinner } from './LoginForm'

export default function SignupForm({ onSubmit, loading, error }) {
  const { theme } = useTheme()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [touched, setTouched]   = useState({ name: false, email: false, password: false })

  const nameErr     = touched.name     && name.trim().length < 2    ? 'Name must be at least 2 characters' : ''
  const emailErr    = touched.email    && !isValidEmail(email)       ? 'Enter a valid email address' : ''
  const passwordErr = touched.password && !isValidPassword(password) ? 'Password must be at least 6 characters' : ''
  const canSubmit   = name.trim().length >= 2 && isValidEmail(email) && isValidPassword(password) && !loading

  function handleSubmit(e) {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true })
    if (!canSubmit) return
    onSubmit({ name: name.trim(), email, password })
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '10px',
          backgroundColor: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: '14px',
        }}>
          <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <AuthField
        label="Full Name" type="text" value={name} onChange={setName}
        onBlur={() => setTouched(t => ({ ...t, name: true }))}
        error={nameErr} placeholder="Your name"
        icon="fa-user" theme={theme} autoComplete="name"
      />

      <AuthField
        label="Email" type="email" value={email} onChange={setEmail}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        error={emailErr} placeholder="you@example.com"
        icon="fa-envelope" theme={theme} autoComplete="email"
      />

      <AuthField
        label="Password" type={showPw ? 'text' : 'password'}
        value={password} onChange={setPassword}
        onBlur={() => setTouched(t => ({ ...t, password: true }))}
        error={passwordErr} placeholder="Min. 6 characters"
        icon="fa-lock" theme={theme} autoComplete="new-password"
        rightEl={
          <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, padding: '0 4px' }}>
            <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '14px' }} />
          </button>
        }
      />

      {/* Password strength bar */}
      {password.length > 0 && <PasswordStrength password={password} theme={theme} />}

      <button type="submit" disabled={!canSubmit} style={{
        width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
        fontSize: '15px', fontWeight: 700, letterSpacing: '0.05em',
        textTransform: 'uppercase', cursor: canSubmit ? 'pointer' : 'not-allowed',
        background: canSubmit
          ? `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`
          : theme.surfaceHover,
        color: canSubmit ? '#ffffff' : theme.textMuted,
        transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        boxShadow: canSubmit ? `0 4px 20px ${theme.primary}44` : 'none',
      }}
        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {loading ? <><BtnSpinner /> Creating account…</> : <><i className="fa-solid fa-user-plus" /> Create Account</>}
      </button>

      <p style={{ textAlign: 'center', fontSize: '14px', color: theme.textSecondary }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: theme.primary, fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.textDecoration = 'underline'}
          onMouseLeave={e => e.target.style.textDecoration = 'none'}>
          Sign in
        </Link>
      </p>
    </form>
  )
}

function PasswordStrength({ password, theme }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']
  const color  = colors[score] ?? '#ef4444'

  return (
    <div style={{ marginTop: '-8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            backgroundColor: i <= score ? color : theme.border,
            transition: 'background-color 0.3s',
          }} />
        ))}
      </div>
      <p style={{ fontSize: '11px', color, fontWeight: 600 }}>
        {password.length < 6 ? 'Too short' : labels[score]}
      </p>
    </div>
  )
}
