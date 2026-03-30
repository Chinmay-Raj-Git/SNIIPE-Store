import axiosClient from './axiosClient'
import { saveToken, clearToken } from '../utils/authUtils'

/**
 * authApi.js
 *
 * Flask auth endpoints (all under /api):
 *   POST /login       { email, password } → { access_token, message }
 *   POST /register    { name, email, password } → { message }
 *   GET  /profile/me  (Bearer) → { id, name, email, phone, created_at }
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
