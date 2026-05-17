import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'
import { isValidEmail, isValidPassword } from '../../utils/authUtils'

// ── Google OAuth handler ───────────────────────────────────
// Dynamically imports @supabase/supabase-js so it only loads
// when the user actually clicks the button.
async function initiateGoogleLogin() {
  const { createClient } = await import('@supabase/supabase-js')

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Must match the "Redirect URLs" configured in your Supabase project dashboard
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google OAuth error:', error)
    throw error
  }
  // Supabase redirects the browser — no return value needed
}

export default function LoginForm({ onSubmit, loading, error }) {
  const { theme } = useTheme()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [touched, setTouched]   = useState({ email: false, password: false })
  const [oauthLoading, setOauthLoading] = useState(false)
  const [oauthError,   setOauthError]   = useState('')

  const emailErr    = touched.email    && !isValidEmail(email)       ? 'Enter a valid email address' : ''
  const passwordErr = touched.password && !isValidPassword(password) ? 'Password must be at least 6 characters' : ''
  const canSubmit   = isValidEmail(email) && isValidPassword(password) && !loading

  function handleSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!canSubmit) return
    onSubmit(email, password)
  }

  async function handleGoogleLogin() {
    setOauthError('')
    setOauthLoading(true)
    try {
      await initiateGoogleLogin()
      // Browser is redirected by Supabase — code below won't run
    } catch {
      setOauthError('Google sign-in failed. Please try again.')
      setOauthLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Server / API error */}
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
            // Official Google "G" logo colours — required per Google brand guidelines
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
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
