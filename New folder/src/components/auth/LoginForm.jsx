import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'
import { isValidEmail, isValidPassword } from '../../utils/authUtils'

export default function LoginForm({ onSubmit, loading, error }) {
  const { theme } = useTheme()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [touched, setTouched]   = useState({ email: false, password: false })

  const emailErr    = touched.email    && !isValidEmail(email)     ? 'Enter a valid email address' : ''
  const passwordErr = touched.password && !isValidPassword(password) ? 'Password must be at least 6 characters' : ''
  const canSubmit   = isValidEmail(email) && isValidPassword(password) && !loading

  function handleSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!canSubmit) return
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Server error */}
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
        label="Email" type="email" value={email} onChange={setEmail}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        error={emailErr} placeholder="you@example.com"
        icon="fa-envelope" theme={theme} autoComplete="email"
      />

      <AuthField
        label="Password" type={showPw ? 'text' : 'password'}
        value={password} onChange={setPassword}
        onBlur={() => setTouched(t => ({ ...t, password: true }))}
        error={passwordErr} placeholder="••••••••"
        icon="fa-lock" theme={theme} autoComplete="current-password"
        rightEl={
          <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, padding: '0 4px' }}>
            <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '14px' }} />
          </button>
        }
      />

      <div style={{ textAlign: 'right', marginTop: '-12px' }}>
        <Link to="/forgot-password" style={{ fontSize: '13px', color: theme.primary, textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.textDecoration = 'underline'}
          onMouseLeave={e => e.target.style.textDecoration = 'none'}>
          Forgot password?
        </Link>
      </div>

      <SubmitBtn disabled={!canSubmit} loading={loading} theme={theme}>
        <i className="fa-solid fa-arrow-right-to-bracket" /> Sign In
      </SubmitBtn>

      <p style={{ textAlign: 'center', fontSize: '14px', color: theme.textSecondary }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: theme.primary, fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.textDecoration = 'underline'}
          onMouseLeave={e => e.target.style.textDecoration = 'none'}>
          Create one
        </Link>
      </p>
    </form>
  )
}

// ── Shared sub-components ──────────────────────────────────

export function AuthField({ label, type, value, onChange, onBlur, error, placeholder, icon, theme, autoComplete, rightEl }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '12px', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: theme.textSecondary, marginBottom: '8px',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <i className={`fa-solid ${icon}`} style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          color: focused ? theme.primary : theme.textMuted,
          fontSize: '14px', transition: 'color 0.2s',
        }} />
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.() }}
          placeholder={placeholder} autoComplete={autoComplete}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: `12px ${rightEl ? '44px' : '14px'} 12px 40px`,
            borderRadius: '10px', fontSize: '14px',
            backgroundColor: theme.surface,
            border: `1.5px solid ${error ? '#ef4444' : focused ? theme.primary : theme.border}`,
            color: theme.textPrimary, outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {rightEl}
          </div>
        )}
      </div>
      {error && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '10px' }} /> {error}
        </p>
      )}
    </div>
  )
}

export function SubmitBtn({ disabled, loading, theme, children }) {
  return (
    <button type="submit" disabled={disabled} style={{
      width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
      fontSize: '15px', fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled
        ? theme.surfaceHover
        : `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
      color: disabled ? theme.textMuted : '#ffffff',
      transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      boxShadow: disabled ? 'none' : `0 4px 20px ${theme.primary}44`,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {loading ? <><BtnSpinner /> Signing in…</> : children}
    </button>
  )
}

export function BtnSpinner() {
  return (
    <span style={{
      width: '16px', height: '16px', borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0,
    }} />
  )
}
