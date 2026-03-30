import { useGlobalLoading } from '../context/LoadingContext'
import { useTheme } from '../theme/ThemeContext'

/**
 * GlobalLoader — renders a subtle full-screen overlay when global loading is active.
 * Mount once inside the app root (MainLayout or App).
 */
export default function GlobalLoader() {
  const { isLoading } = useGlobalLoading()
  const { theme }     = useTheme()

  if (!isLoading) return null

  return (
    <div
      className={`global-loader ${isLoading ? 'active' : ''}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {/* Spinning ring */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          border: `3px solid ${theme.primary}33`,
          borderTopColor: theme.primary,
          animation: 'spin 0.75s linear infinite',
        }} />
        <p style={{
          fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: theme.textSecondary,
        }}>
          Loading…
        </p>
      </div>
    </div>
  )
}
