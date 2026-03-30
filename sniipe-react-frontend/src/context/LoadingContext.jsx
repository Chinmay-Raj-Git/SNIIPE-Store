import { createContext, useContext, useState, useCallback, useRef } from 'react'

const LoadingContext = createContext(null)

/**
 * LoadingProvider — wraps the app and provides a global loading state.
 *
 * Usage:
 *   const { startLoading, stopLoading } = useGlobalLoading()
 *   startLoading()
 *   await doSomething()
 *   stopLoading()
 *
 * Multiple callers can call startLoading independently; the overlay stays
 * until ALL callers have called stopLoading (ref-count pattern).
 */
export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const refCount = useRef(0)

  const startLoading = useCallback(() => {
    refCount.current += 1
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    refCount.current = Math.max(0, refCount.current - 1)
    if (refCount.current === 0) {
      setIsLoading(false)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useGlobalLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useGlobalLoading must be used inside LoadingProvider')
  return ctx
}
