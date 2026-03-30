import { useTheme } from '../../theme/ThemeContext'
import { formatINR } from '../../utils/priceUtils'

/**
 * CartSummary — right panel on Cart + Checkout pages.
 *
 * Props:
 *   subtotal       — number
 *   couponResult   — from apiApplyCoupon: { discount_amount, final_total, coupon_code, status }
 *   ctaLabel       — string
 *   ctaDisabled    — bool
 *   ctaLoading     — bool
 *   onCta          — fn
 *   extra          — optional JSX (e.g. CouponInput)
 */
export default function CartSummary({
  subtotal = 0,
  couponResult = null,
  ctaLabel = 'Proceed to Checkout',
  ctaDisabled = false,
  ctaLoading = false,
  onCta,
  extra,
}) {
  const { theme } = useTheme()

  const discount = couponResult ? parseFloat(couponResult.discount_amount ?? 0) : 0
  // Always free delivery as per spec
  const total = couponResult
    ? parseFloat(couponResult.final_total)
    : Math.max(0, subtotal - discount)

  return (
    <div style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px', position: 'sticky', top: '120px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '20px' }}>
        Order Summary
      </h2>

      {/* Line items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <SummaryRow label="Subtotal" value={formatINR(subtotal)} theme={theme} />

        {discount > 0 && (
          <SummaryRow label={`Coupon (${couponResult.coupon_code})`} value={`-${formatINR(discount)}`} valueColor="#22c55e" theme={theme} />
        )}

        {/* Always show Free Delivery */}
        <SummaryRow
          label="Delivery"
          value={<span style={{ color: '#22c55e', fontWeight: 700 }}>FREE</span>}
          theme={theme}
        />
      </div>

      {/* Divider + total */}
      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '16px', marginBottom: '20px' }}>
        <SummaryRow label="Total" value={formatINR(total)} large theme={theme} valueColor={theme.primary} />
      </div>

      {/* Extra slot (CouponInput etc.) */}
      {extra && <div style={{ marginBottom: '16px' }}>{extra}</div>}

      {/* CTA */}
      <button
        onClick={onCta}
        disabled={ctaDisabled || ctaLoading}
        style={{ width: '100%', padding: '15px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', letterSpacing: '0.05em', textTransform: 'uppercase', border: 'none', cursor: ctaDisabled || ctaLoading ? 'not-allowed' : 'pointer', background: ctaDisabled || ctaLoading ? theme.surfaceHover : `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: ctaDisabled || ctaLoading ? theme.textMuted : '#fff', boxShadow: !ctaDisabled ? `0 8px 24px ${theme.primary}44` : 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        onMouseEnter={e => { if (!ctaDisabled && !ctaLoading) e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {ctaLoading
          ? <><Spinner />{ctaLabel}</>
          : <><i className="fa-solid fa-lock" style={{ fontSize: '13px' }} />{ctaLabel}</>}
      </button>

      {/* Trust row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
        {[{ icon: 'fa-shield-halved', label: 'Secure' }, { icon: 'fa-truck', label: 'Free Delivery' }, { icon: 'fa-rotate-left', label: '7-Day Returns' }].map(({ icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: theme.textMuted }}>
            <i className={`fa-solid ${icon}`} style={{ color: theme.iconColor }} /> {label}
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, large, valueColor, theme }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: large ? '15px' : '14px', fontWeight: large ? 700 : 500, color: theme.textSecondary }}>{label}</span>
      <span style={{ fontSize: large ? '20px' : '14px', fontWeight: large ? 800 : 600, color: valueColor ?? theme.textPrimary }}>{value}</span>
    </div>
  )
}

function Spinner() {
  return <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
}