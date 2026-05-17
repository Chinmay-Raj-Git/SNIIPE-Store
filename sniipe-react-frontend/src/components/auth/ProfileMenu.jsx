import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'
import { useAuth } from '../../hooks/useAuth'

/**
 * ProfileMenu — avatar button + dropdown shown in Navbar when logged in.
 */
export default function ProfileMenu() {
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 10px', borderRadius: '999px',
        backgroundColor: open ? theme.primaryMuted : 'transparent',
        border: `1.5px solid ${open ? theme.primary : theme.border}`,
        cursor: 'pointer', transition: 'all 0.2s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.backgroundColor = theme.primaryMuted }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.backgroundColor = 'transparent' } }}
      >
        <span style={{
          width: '28px', height: '28px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: theme.primary, color: '#fff',
          fontSize: '11px', fontWeight: 700, flexShrink: 0,
        }}>
          {initials}
        </span>
        <span className="hidden lg:block" style={{
          fontSize: '13px', fontWeight: 600, color: theme.textPrimary,
          maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user?.name?.split(' ')[0] ?? 'Account'}
        </span>
        <i className="fa-solid fa-chevron-down" style={{
          fontSize: '10px', color: theme.textMuted,
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
        }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          minWidth: '210px', borderRadius: '12px',
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
          overflow: 'hidden', zIndex: 100,
        }}>
          {/* User info */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary, marginBottom: '2px' }}>
              {user?.name ?? 'User'}
            </p>
            <p style={{ fontSize: '12px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>

          {/* Links */}
          <div style={{ padding: '6px' }}>
            <DropItem to="/profile"  icon="fa-user"         label="My Profile"  theme={theme} onClose={() => setOpen(false)} />
            <DropItem to="/orders"   icon="fa-box"          label="My Orders"   theme={theme} onClose={() => setOpen(false)} />
            <DropItem to="/cart"     icon="fa-bag-shopping" label="My Cart"     theme={theme} onClose={() => setOpen(false)} />
          </div>

          {/* Logout */}
          <div style={{ padding: '6px', borderTop: `1px solid ${theme.border}` }}>
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', color: '#ef4444', fontWeight: 500, textAlign: 'left',
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: '16px', textAlign: 'center' }} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DropItem({ to, icon, label, theme, onClose }) {
  return (
    <Link to={to} onClick={onClose} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 12px', borderRadius: '8px',
      textDecoration: 'none', fontSize: '14px',
      color: theme.textPrimary, fontWeight: 500,
    }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.surfaceHover}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <i className={`fa-solid ${icon}`} style={{ width: '16px', textAlign: 'center', color: theme.iconColor }} />
      {label}
    </Link>
  )
}
