import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import axiosClient from '../api/axiosClient'

const ServerStatusContext = createContext(null)

/**
 * ServerStatusProvider
 *
 * Detects backend unavailability by hooking into the shared axiosClient
 * response interceptor. Exposes:
 *
 *   isServerDown  — true when a network/timeout/5xx error was detected
 *   lastError     — short human-readable reason string
 *   dismiss       — manually hide the banner (resets on next error)
 *   retry         — force-reload the current page to retry
 *
 * Detection criteria (all indicate the server is not reachable / not healthy):
 *   • axios network error (error.request exists but error.response is null)
 *   • request timeout (error.code === 'ECONNABORTED')
 *   • HTTP 502, 503, 504 (gateway/upstream errors)
 *
 * 4xx errors (400, 401, 403, 404, 422) are intentional API errors,
 * NOT server-down events — they are intentionally excluded.
 *
 * Auto-recovery: if a successful response arrives after a down state,
 * the banner automatically clears itself.
 */
export function ServerStatusProvider({ children }) {
  const [isServerDown, setIsServerDown] = useState(false)
  const [lastError, setLastError]       = useState('')
  const [dismissed, setDismissed]       = useState(false)

  // Use refs so interceptor callbacks always see latest state without
  // causing the interceptor to be re-registered on every render.
  const isDownRef   = useRef(false)
  const interceptorIdsRef = useRef({ request: null, response: null })

  const markDown = useCallback((reason) => {
    if (!isDownRef.current) {
      isDownRef.current = true
      setIsServerDown(true)
      setLastError(reason)
      setDismissed(false)
    }
  }, [])

  const markUp = useCallback(() => {
    if (isDownRef.current) {
      isDownRef.current = false
      setIsServerDown(false)
      setLastError('')
    }
  }, [])

  const dismiss = useCallback(() => setDismissed(true), [])

  const retry = useCallback(() => {
    setDismissed(false)
    setIsServerDown(false)
    isDownRef.current = false
    window.location.reload()
  }, [])

  // Register axios interceptors once on mount, eject on unmount
  useEffect(() => {
    const responseId = axiosClient.interceptors.response.use(
      // Success path — clear down state if it was set
      (response) => {
        markUp()
        return response
      },
      // Error path — classify and mark down if appropriate
      (error) => {
        const status = error.response?.status
        const isTimeout  = error.code === 'ECONNABORTED'
        const isNetwork  = !error.response && error.request  // request sent, no response
        const isGateway  = status === 502 || status === 503 || status === 504

        if (isTimeout) {
          markDown('Server is taking too long to respond.')
        } else if (isNetwork) {
          markDown('Cannot reach the server. Check your connection.')
        } else if (isGateway) {
          markDown(`Server is temporarily unavailable (${status}).`)
        }
        // All other errors (4xx, etc.) are normal API errors — don't touch down state

        return Promise.reject(error)
      }
    )

    interceptorIdsRef.current.response = responseId

    return () => {
      axiosClient.interceptors.response.eject(responseId)
    }
  }, [markDown, markUp])

  const visible = isServerDown && !dismissed

  return (
    <ServerStatusContext.Provider value={{ isServerDown, lastError, dismiss, retry, visible }}>
      {children}
    </ServerStatusContext.Provider>
  )
}

export function useServerStatus() {
  const ctx = useContext(ServerStatusContext)
  if (!ctx) throw new Error('useServerStatus must be used inside ServerStatusProvider')
  return ctx
}
