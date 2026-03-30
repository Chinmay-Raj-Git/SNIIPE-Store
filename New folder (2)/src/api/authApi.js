import axiosClient from './axiosClient'
import { saveToken, clearToken } from '../utils/authUtils'

/**
 * authApi.js
 *
 * Flask auth endpoints (all under /api):
 *   POST /login             { email, password }    → { access_token, message }
 *   POST /register          { name, email, password } → { message }
 *   GET  /profile/me        (Bearer)               → { id, name, email, phone, created_at }
 *   POST /auth/oauth-login  { access_token }       → { access_token, message }
 */

export async function login(email, password) {
  const { data } = await axiosClient.post('/login', { email, password })
  if (!data.access_token) throw new Error('No token in response')
  saveToken(data.access_token)
  // Fetch the user profile immediately so AuthContext gets the full user object
  const user = await getCurrentUser()
  return { user, token: data.access_token }
}

export async function signup({ name, email, password }) {
  const { data } = await axiosClient.post('/register', { name, email, password })
  return data
}

export function logout() {
  clearToken()
}

export async function getCurrentUser() {
  const { data } = await axiosClient.get('/profile/me')
  return data // { id, name, email, phone, created_at, ... }
}

/**
 * oauthLogin
 * Called by OAuthCallback after Supabase sets the session.
 * Sends the Supabase access_token to our Flask backend, which:
 *   1. Verifies the token with Supabase
 *   2. Creates the user in our DB if they don't exist yet
 *   3. Returns the same access_token for us to store
 *
 * @param {string} supabaseAccessToken — from supabase.auth.getSession()
 */
export async function oauthLogin(supabaseAccessToken) {
  const { data } = await axiosClient.post('/auth/oauth-login', {
    access_token: supabaseAccessToken,
  })
  if (!data.access_token) throw new Error('No token returned from OAuth login')
  // Persist token exactly the same way as email login
  saveToken(data.access_token)
  return data
}
