import { useState, useEffect } from 'react'
import { useServerStatus } from '../context/ServerStatusContext'
import { useTheme } from '../theme/ThemeContext'

/**
 * ServerDownBanner
 *
 * A non-blocking sticky banner that appears at the bottom of the screen
 * when the backend is detected as unavailable.
 *
 * - Slides up from the bottom with a CSS animation
 * - Shows the error reason + a Retry button + a dismiss (×) button
 * - Does NOT block any UI interaction (pointer-events contained to banner only)
 * - Auto-clears when a successful API response is received (via context)
 */
export default function ServerDownBanner() {
  const { visible, lastError, dismiss, retry } = useServerStatus()
  const { theme } = useTheme()
  const [animIn, setAnimIn] = useState(false)

  // Trigger slide-in animation after mount
  useEffect(() => {
    if (visible) {
      // Tiny delay so the browser paints the initial off-screen position first
      const t = setTimeout(() => setAnimIn(true), 30)
      return () => clearTimeout(t)
    } else {
      setAnimIn(false)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: animIn
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(120%)',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 10000,
        maxWidth: '560px',
        width: 'calc(100vw - 32px)',
        // Pointer events only on the banner, so page remains usable
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          borderRadius: '14px',
          backgroundColor: '#1a0a0a',
          border: '1px solid rgba(239,68,68,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Pulsing indicator dot */}
        <div style={{ flexShrink: 0, position: 'relative', width: '10px', height: '10px' }}>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            backgroundColor: '#ef4444',
            animation: 'pulse 1.6s ease-in-out infinite',
          }} />
          <span style={{
            position: 'absolute', inset: '-4px', borderRadius: '50%',
            backgroundColor: 'rgba(239,68,68,0.25)',
            animation: 'pulse 1.6s ease-in-out infinite',
            animationDelay: '0.3s',
          }} />
        </div>

        {/* Icon */}
        <i
          className="fa-solid fa-triangle-exclamation"
          style={{ color: '#ef4444', fontSize: '15px', flexShrink: 0 }}
        />

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '13px', fontWeight: 700, color: '#ffffff',
            marginBottom: '1px', lineHeight: 1.3,
          }}>
            Server Unreachable
          </p>
          <p style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {lastError || 'Unable to connect to the server.'}
          </p>
        </div>

        {/* Retry button */}
        <button
          onClick={retry}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            border: '1px solid rgba(239,68,68,0.5)',
            backgroundColor: 'rgba(239,68,68,0.12)',
            color: '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.25)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.8)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
          }}
        >
          <i className="fa-solid fa-rotate-right" style={{ marginRight: '5px', fontSize: '10px' }} />
          Retry
        </button>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            flexShrink: 0,
            width: '28px', height: '28px',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ffffff'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  )
}
