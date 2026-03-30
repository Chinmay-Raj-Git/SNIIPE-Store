import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'
import { isValidEmail, isValidPassword } from '../../utils/authUtils'
import { AuthField, BtnSpinner } from './LoginForm'

// Reuse the same OAuth initiator — LoginForm exports initiateGoogleLogin
// but we define it inline here to keep SignupForm self-contained.
async function initiateGoogleLogin() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  )
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
}

export default function SignupForm({ onSubmit, loading, error }) {
  const { theme } = useTheme()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [touched, setTouched]   = useState({ name: false, email: false, password: false })
  const [oauthLoading, setOauthLoading] = useState(false)
  const [oauthError,   setOauthError]   = useState('')

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

  async function handleGoogleLogin() {
    setOauthError('')
    setOauthLoading(true)
    try {
      await initiateGoogleLogin()
    } catch {
      setOauthError('Google sign-in failed. Please try again.')
      setOauthLoading(false)
    }
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

      {/* ── Google OAuth button ── */}
      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={oauthLoading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '12px 16px', borderRadius: '10px',
            border: `1.5px solid ${theme.border}`,
            backgroundColor: theme.surfaceHover,
            color: theme.textPrimary,
            fontSize: '14px', fontWeight: 600,
            cursor: oauthLoading ? 'wait' : 'pointer',
            transition: 'border-color 0.2s, background-color 0.2s',
            opacity: oauthLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!oauthLoading) e.currentTarget.style.borderColor = theme.primary }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border }}
        >
          {oauthLoading ? (
            <BtnSpinner />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          {oauthLoading ? 'Redirecting…' : 'Sign up with Google'}
        </button>

        {oauthError && (
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '10px' }} /> {oauthError}
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: theme.border }} />
        <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500, letterSpacing: '0.05em' }}>
          OR
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: theme.border }} />
      </div>

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
