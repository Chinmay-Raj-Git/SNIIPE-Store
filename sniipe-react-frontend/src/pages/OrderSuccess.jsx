import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { apiFetchOrderDetail } from '../api/orderApi'
import { formatINR } from '../utils/priceUtils'

export default function OrderSuccess() {
  const { id } = useParams()
  const { theme } = useTheme()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    apiFetchOrderDetail(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div style={{
      backgroundColor: theme.background, minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>

        {/* Checkmark */}
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 28px',
          background: 'rgba(34,197,94,0.12)',
          border: '2px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'successPop 0.5s ease-out',
        }}>
          <i className="fa-solid fa-check" style={{ fontSize: '36px', color: '#22c55e' }} />
        </div>

        <p style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em',
          textTransform: 'uppercase', color: '#22c55e', marginBottom: '10px',
        }}>
          Order Confirmed
        </p>

        <h1 className="font-heading" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900,
          color: theme.textPrimary, lineHeight: 1, marginBottom: '12px',
        }}>
          Thank You!
        </h1>

        <p style={{ fontSize: '15px', color: theme.textSecondary, marginBottom: '32px' }}>
          Your order <span style={{ fontWeight: 700, color: theme.primary }}>SN-{id}</span> has been placed successfully.
          We'll send you a confirmation soon.
        </p>

        {/* Order details card */}
        {loading ? (
          <div style={{ height: '200px', borderRadius: '16px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite', marginBottom: '32px' }} />
        ) : order ? (
          <div style={{
            backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '32px',
          }}>
            {/* Order meta */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '14px', borderBottom: `1px solid ${theme.border}`, marginBottom: '16px',
              flexWrap: 'wrap', gap: '8px',
            }}>
              <div>
                <p style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>Order ID</p>
                <p style={{ fontWeight: 800, color: theme.primary, fontSize: '16px' }}>SN-{order.id}</p>
              </div>
              <StatusBadge status={order.status_label ?? order.status} />
            </div>

            {/* Items */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: theme.textMuted, marginBottom: '10px' }}>Items</p>
              {(order.items ?? []).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: i < order.items.length - 1 ? `1px solid ${theme.border}` : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary }}>{item.product}</p>
                    <p style={{ fontSize: '12px', color: theme.textMuted }}>
                      {[item.variant_color, item.variant_size].filter(Boolean).join(' · ')} × {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary }}>
                    {formatINR(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: '12px', borderTop: `1px solid ${theme.border}`,
            }}>
              <span style={{ fontWeight: 700, color: theme.textSecondary }}>Total Paid</span>
              <span style={{ fontWeight: 800, fontSize: '18px', color: theme.primary }}>
                {formatINR(order.final_total)}
              </span>
            </div>

            {/* Shipping address */}
            {order.address?.line1 && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${theme.border}` }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: theme.textMuted, marginBottom: '6px' }}>
                  Delivering to
                </p>
                <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.6 }}>
                  {order.address.name && <><strong style={{ color: theme.textPrimary }}>{order.address.name}</strong> · </>}
                  {[order.address.line1, order.address.line2, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/home" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 28px', borderRadius: '12px', fontWeight: 700,
            fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em',
            textDecoration: 'none', color: '#fff',
            background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
            boxShadow: `0 8px 24px ${theme.primary}44`,
          }}>
            <i className="fa-solid fa-bag-shopping" /> Continue Shopping
          </Link>
          <Link to="/profile" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 22px', borderRadius: '12px', fontWeight: 600,
            fontSize: '14px', textDecoration: 'none',
            border: `1.5px solid ${theme.border}`, color: theme.textSecondary,
          }}>
            View Profile
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function StatusBadge({ status }) {
  const isGood = ['paid', 'shipping_created', 'shipped', 'delivered'].includes(status?.toLowerCase())
  return (
    <span style={{
      fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px',
      backgroundColor: isGood ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.1)',
      color: isGood ? '#22c55e' : '#f59e0b',
      border: `1px solid ${isGood ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
      textTransform: 'capitalize',
    }}>
      {status ?? 'Processing'}
    </span>
  )
}
