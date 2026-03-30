import { useState } from 'react'
import { useTheme } from '../../theme/ThemeContext'
import { formatINR } from '../../utils/priceUtils'

// Map backend error messages to friendly labels
function friendlyCouponError(msg) {
  const lower = (msg ?? '').toLowerCase()
  if (lower.includes('expired')) return { type: 'expired', text: 'Coupon Expired' }
  if (lower.includes('not found') || lower.includes('invalid') || lower.includes('does not exist')) return { type: 'invalid', text: 'Invalid Coupon Code' }
  if (lower.includes('minimum')) return { type: 'min', text: msg }
  return { type: 'error', text: msg || 'Could not apply coupon' }
}

export default function CouponInput({ onApply, onRemove, applied, loading }) {
  const { theme } = useTheme()
  const [code, setCode] = useState('')
  const [err, setErr]   = useState(null) // { type, text }

  async function handleApply() {
    if (!code.trim()) return
    setErr(null)
    try {
      await onApply(code.trim().toUpperCase())
      setCode('')
    } catch (e) {
      setErr(friendlyCouponError(e.message))
    }
  }

  if (applied) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <i className="fa-solid fa-tag" style={{ color: '#22c55e', fontSize: '13px' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e', marginBottom: '1px' }}>
            Coupon Applied — {applied.coupon_code}
          </p>
          <p style={{ fontSize: '12px', color: theme.textSecondary }}>
            You save {formatINR(applied.discount_amount)}
          </p>
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, fontSize: '14px', padding: '2px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
          title="Remove coupon"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    )
  }

  const errorIcon = err?.type === 'expired' ? 'fa-clock' : 'fa-circle-exclamation'
  const errorColor = err?.type === 'expired' ? '#f59e0b' : '#ef4444'

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setErr(null) }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder="Coupon code"
          style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${err ? errorColor : theme.border}`, backgroundColor: theme.surface, color: theme.textPrimary, fontSize: '13px', outline: 'none', letterSpacing: '0.05em', transition: 'border-color 0.2s' }}
          onFocus={e => { if (!err) e.target.style.borderColor = theme.primary }}
          onBlur={e => { if (!err) e.target.style.borderColor = theme.border }}
        />
        <button onClick={handleApply} disabled={!code.trim() || loading} style={{ padding: '10px 18px', borderRadius: '8px', background: code.trim() && !loading ? `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})` : theme.surfaceHover, color: code.trim() && !loading ? '#fff' : theme.textMuted, border: 'none', fontWeight: 700, fontSize: '13px', cursor: code.trim() && !loading ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading ? <><Spinner /> Checking</> : 'Apply'}
        </button>
      </div>
      {err && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: errorColor, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <i className={`fa-solid ${errorIcon}`} style={{ fontSize: '10px' }} /> {err.text}
        </p>
      )}
    </div>
  )
}

function Spinner() {
  return <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
}

