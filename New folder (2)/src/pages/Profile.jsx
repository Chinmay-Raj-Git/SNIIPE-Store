import { useState } from 'react'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { updateUserProfile } from '../api/userApi'

export default function Profile() {
  const { theme } = useTheme()
  const { user, fetchUser, logout } = useAuth()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')
  const [name, setName]       = useState(user?.name  ?? '')
  const [phone, setPhone]     = useState(user?.phone ?? '')

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) { setSaveErr('Name is required'); return }
    setSaving(true); setSaveErr('')
    try {
      await updateUserProfile({ name: name.trim(), phone })
      await fetchUser()
      setSaveMsg('Profile updated!')
      setEditing(false)
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveErr('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setName(user?.name ?? ''); setPhone(user?.phone ?? '')
    setEditing(false); setSaveErr('')
  }

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: theme.primary, marginBottom: '8px' }}>
            Account
          </p>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: theme.textPrimary, lineHeight: 1 }}>
            My Profile
          </h1>
        </div>

        {/* Avatar card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '24px', fontWeight: 800,
            boxShadow: `0 8px 24px ${theme.primary}44`,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '4px' }}>
              {user?.name ?? '—'}
            </h2>
            <p style={{ fontSize: '14px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{
              flexShrink: 0, padding: '8px 18px', borderRadius: '8px',
              border: `1.5px solid ${theme.border}`,
              backgroundColor: 'transparent', color: theme.textSecondary,
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
            >
              <i className="fa-solid fa-pen" style={{ marginRight: '6px', fontSize: '11px' }} />
              Edit
            </button>
          )}
        </div>

        {/* Success msg */}
        {saveMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', borderRadius: '10px',
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e', fontSize: '14px', marginBottom: '20px',
          }}>
            <i className="fa-solid fa-check" /> {saveMsg}
          </div>
        )}

        {/* Details card */}
        <div style={{
          backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '16px', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary }}>
              Account Details
            </h3>
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <EditField label="Full Name" icon="fa-user" theme={theme}>
                <input value={name} onChange={e => setName(e.target.value)}
                  style={inputStyle(theme)}
                  onFocus={e => e.target.style.borderColor = theme.primary}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </EditField>
              <EditField label="Email" icon="fa-envelope" theme={theme}>
                <input value={user?.email ?? ''} disabled style={{ ...inputStyle(theme), backgroundColor: theme.surfaceHover, color: theme.textMuted, cursor: 'not-allowed' }} />
                <p style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>Email cannot be changed</p>
              </EditField>
              <EditField label="Phone" icon="fa-phone" theme={theme}>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX" style={inputStyle(theme)}
                  onFocus={e => e.target.style.borderColor = theme.primary}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </EditField>

              {saveErr && (
                <p style={{ fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-circle-exclamation" /> {saveErr}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  cursor: saving ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  {saving
                    ? <><Spinner /> Saving…</>
                    : <><i className="fa-solid fa-check" /> Save Changes</>}
                </button>
                <button type="button" onClick={handleCancel} style={{
                  padding: '12px 20px', borderRadius: '10px',
                  border: `1.5px solid ${theme.border}`,
                  backgroundColor: 'transparent', color: theme.textSecondary,
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ paddingBottom: '8px' }}>
              <InfoRow label="Full Name"    value={user?.name}  icon="fa-user"     theme={theme} />
              <InfoRow label="Email"        value={user?.email} icon="fa-envelope" theme={theme} />
              <InfoRow label="Phone"        value={user?.phone || '—'} icon="fa-phone" theme={theme} />
              <InfoRow label="Member since"
                value={user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
                icon="fa-calendar" theme={theme}
              />
            </div>
          )}
        </div>

        {/* Orders placeholder */}
        <div style={{
          backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '16px', padding: '32px 24px', marginTop: '20px', textAlign: 'center',
        }}>
          <i className="fa-solid fa-box" style={{ fontSize: '32px', color: theme.textMuted, opacity: 0.25, display: 'block', marginBottom: '12px' }} />
          <p style={{ color: theme.textSecondary, fontWeight: 600, marginBottom: '4px' }}>Order History</p>
          <p style={{ color: theme.textMuted, fontSize: '13px' }}>Coming in Phase 4</p>
        </div>

        {/* Sign out */}
        <div style={{
          marginTop: '32px', padding: '20px 24px', borderRadius: '16px',
          border: '1px solid rgba(239,68,68,0.2)',
          backgroundColor: 'rgba(239,68,68,0.04)',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444', marginBottom: '12px' }}>
            Sign Out
          </h3>
          <button onClick={logout} style={{
            padding: '10px 20px', borderRadius: '8px',
            border: '1.5px solid rgba(239,68,68,0.4)',
            backgroundColor: 'transparent', color: '#ef4444',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" />
            Sign out of SNIIPE
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────

function inputStyle(theme) {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: '8px',
    border: `1.5px solid ${theme.border}`,
    backgroundColor: theme.background,
    color: theme.textPrimary, fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
  }
}

function InfoRow({ label, value, icon, theme }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '14px 24px', borderBottom: `1px solid ${theme.border}`,
    }}>
      <i className={`fa-solid ${icon}`} style={{ width: '16px', textAlign: 'center', color: theme.iconColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '2px' }}>
          {label}
        </p>
        <p style={{ fontSize: '14px', color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value ?? '—'}
        </p>
      </div>
    </div>
  )
}

function EditField({ label, icon, theme, children }) {
  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '8px',
      }}>
        <i className={`fa-solid ${icon}`} style={{ color: theme.iconColor }} /> {label}
      </label>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      width: '14px', height: '14px', borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0,
    }} />
  )
}
