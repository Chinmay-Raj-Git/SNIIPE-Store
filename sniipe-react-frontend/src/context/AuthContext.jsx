import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getCurrentUser,
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
} from '../api/authApi'
import { isTokenPresent, clearToken } from '../utils/authUtils'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [isAuthenticated, setIsAuth] = useState(false)
  const [loading, setLoading]       = useState(true) // true until session check done

  // ── Session restore on app load ───────────────────────────
  const fetchUser = useCallback(async () => {
    if (!isTokenPresent()) {
      setLoading(false)
      return
    }
    try {
      const userData = await getCurrentUser()
      setUser(userData)
      setIsAuth(true)
    } catch {
      // Token expired or invalid
      clearToken()
      setUser(null)
      setIsAuth(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  // ── login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { user: userData } = await apiLogin(email, password)
    setUser(userData)
    setIsAuth(true)
    return userData
  }, [])

  // ── signup ────────────────────────────────────────────────
  const signup = useCallback(async (formData) => {
    return await apiSignup(formData)
  }, [])

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
    setIsAuth(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be inside <AuthProvider>')
  return ctx
}

export default AuthContext
