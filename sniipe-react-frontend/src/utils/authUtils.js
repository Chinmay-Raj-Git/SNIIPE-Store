/**
 * authUtils.js
 * Token helpers (localStorage) + form validators.
 */

const TOKEN_KEY = 'sniipe_access_token'

export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else        localStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isTokenPresent() {
  return Boolean(getToken())
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6
}
