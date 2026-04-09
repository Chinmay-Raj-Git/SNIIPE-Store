import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { oauthLogin } from '../api/authApi'

/**
 * OAuthCallback
 *
 * Mounted at /auth/callback — the exact redirectTo URL passed to Supabase
 * in the Google OAuth flow.
 *
 * Flow (mirrors oauth_callback.html from the backend):
 *   1. Supabase detects the OAuth tokens in the URL hash/code (detectSessionInUrl: true)
 *      and automatically sets the session in its local storage.
 *   2. We import supabase dynamically (avoids bundling the full lib on every page).
 *   3. We call getSession() to retrieve the access_token Supabase set.
 *   4. We POST that token to our Flask backend /auth/oauth-login, which verifies
 *      it, creates the user in the DB if needed, and returns the same token.
 *   5. We call fetchUser() from AuthContext so isAuthenticated flips to true
 *      and the user object populates — same result as a regular email login.
 *   6. We redirect to the originally intended page (or /home as fallback).
 */
export default function OAuthCallback() {
  const { theme }     = useTheme()
  const { fetchUser } = useAuth()
  const navigate      = useNavigate()
  const location      = useLocation()
  const ranRef        = useRef(false) // guard against StrictMode double-fire

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    async function handleCallback() {
      try {
        // Dynamically import supabase-js so it only loads on this page
        const { createClient } = await import('@supabase/supabase-js')

        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          {
            auth: {
              flowType: 'pkce',
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true, // this reads the URL hash/code automatically
            },
          }
        )

        // Give Supabase a moment to process the URL tokens
        const { data, error } = await supabase.auth.getSession()

        if (error || !data?.session) {
          console.error('OAuthCallback: no session found', error)
          navigate('/login', { replace: true })
          return
        }

        // Hand the Supabase access_token to our Flask backend.
        // The backend verifies it, creates/looks up the local user,
        // and echoes back the same access_token for us to store.
        await oauthLogin(data.session.access_token)

        // Refresh AuthContext — this calls GET /profile/me with the
        // stored token and sets user + isAuthenticated = true
        await fetchUser()

        // Redirect: use the location the user originally tried to visit,
        // fall back to /collections
        const intended = location.state?.from?.pathname ?? '/collections'
        navigate(intended, { replace: true })

      } catch (err) {
        console.error('OAuthCallback error:', err)
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [fetchUser, navigate, location])

  // Minimal centered loading state — matches existing auth page style
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: `3px solid ${theme.border}`,
        borderTopColor: theme.primary,
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: theme.textMuted, fontSize: '14px' }}>
        Completing sign-in…
      </p>
    </div>
  )
}
