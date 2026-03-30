import { useAuthContext } from '../context/AuthContext'

/**
 * useAuth — thin convenience wrapper.
 * Usage:  const { user, isAuthenticated, login, logout } = useAuth()
 */
export function useAuth() {
  return useAuthContext()
}

export default useAuth
