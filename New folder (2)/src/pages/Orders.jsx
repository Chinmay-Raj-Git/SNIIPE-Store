import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { apiFetchOrders, apiFetchOrderDetail } from '../api/orderApi'

// ─────────────────────────────────────────────────────────────
// STATUS CONFIG
// Matches exactly what the backend returns in order.status
// ─────────────────────────────────────────────────────────────

const STATUS_FLOW = [
  { key: 'paid',             label: 'Order Placed'    },
  { key: 'shipping_created', label: 'Confirmed'       },
  { key: 'awb_assigned',     label: 'Dispatched'      },
  { key: 'in_transit',       label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered'       },
]

// Maps backend status → human badge label + color tokens (no hardcoded hex)
const STATUS_BADGE = {
  pending:          { label: 'Pending Payment', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   text: '#ca8a04' },
  pending_payment:  { label: 'Pending Payment', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   text: '#ca8a04' },
  pending_whatsapp: { label: 'WhatsApp Order',  bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   text: '#16a34a' },
  paid:             { label: 'Order Placed',    bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  text: '#2563eb' },
  shipping_created: { label: 'Confirmed',       bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#9333ea' },
  awb_assigned:     { label: 'Dispatched',      bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', text: '#4f46e5' },
  in_transit:       { label: 'On the Way',      bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', text: '#ea580c' },
  delivered:        { label: 'Delivered',       bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#16a34a' },
  cancelled:        { label: 'Cancelled',       bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#dc2626' },
}

const fallbackBadge = { label: 'Processing', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', text: '#6b7280' }

// ─────────────────────────────────────────────────────────────
// SPINNER — reused from existing codebase style
// ─────────────────────────────────────────────────────────────
function Spinner({ size = 32, color }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      borderRadius: '50%',
      border: `2.5px solid rgba(128,128,128,0.2)`,
      borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ─────────────────────────────────────────────────────────────
// STATUS STEPPER
// Visual step-by-step progress bar, only shown for active orders
// ─────────────────────────────────────────────────────────────
function StatusStepper({ status, theme }) {
  const currentIndex = STATUS_FLOW.findIndex(s => s.key === status)
  if (currentIndex === -1) return null

  return (
    <div style={{ padding: '0 20px 16px', marginTop: '-4px' }}>
      {/* Steps row */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STATUS_FLOW.map((step, idx) => {
          const isDone   = idx <= currentIndex
          const isActive = idx === currentIndex

          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_FLOW.length - 1 ? 1 : 'none' }}>
              {/* Circle node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  border: `2px solid ${isDone ? theme.primary : theme.border}`,
                  backgroundColor: isDone ? theme.primary : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? `0 0 0 3px ${theme.primary}33` : 'none',
                  transition: 'all 0.3s',
                }}>
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {/* Label — hidden on xs, shown on sm+ */}
                <span style={{
                  fontSize: '10px',
                  marginTop: '5px',
                  color: isDone ? theme.primary : theme.textMuted,
                  fontWeight: isDone ? 600 : 400,
                  textAlign: 'center',
                  width: '54px',
                  lineHeight: 1.3,
                  display: 'none',  // overridden via className below
                }}
                  className="sm-step-label"
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STATUS_FLOW.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  margin: '0 3px',
                  marginBottom: isActive ? '0' : '0',
                  backgroundColor: idx < currentIndex ? theme.primary : theme.border,
                  transition: 'background-color 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Current step label — always visible below */}
      <p style={{
        fontSize: '12px',
        color: theme.primary,
        fontWeight: 600,
        marginTop: '10px',
        letterSpacing: '0.02em',
      }}>
        {STATUS_FLOW[currentIndex]?.label}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ORDER ITEM ROW
// Shows product thumbnail, name, variant, qty, price, subtotal
// ─────────────────────────────────────────────────────────────
function OrderItemRow({ item, theme }) {
  const variantLabel = [item.variant_color, item.variant_size].filter(Boolean).join(' · ')

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '14px 0',
      borderBottom: `1px solid ${theme.border}`,
    }}>
      {/* Thumbnail */}
      {item.thumbnail ? (
        <img
          src={item.thumbnail}
          alt={item.product}
          style={{
            width: '52px', height: '52px',
            objectFit: 'cover',
            borderRadius: '8px',
            flexShrink: 0,
            backgroundColor: theme.surfaceHover,
          }}
        />
      ) : (
        <div style={{
          width: '52px', height: '52px',
          borderRadius: '8px',
          flexShrink: 0,
          backgroundColor: theme.surfaceHover,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-shirt" style={{ color: theme.textMuted, fontSize: '18px' }} />
        </div>
      )}

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '14px', fontWeight: 600,
          color: theme.textPrimary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: '3px',
        }}>
          {item.product}
        </p>
        {variantLabel && (
          <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '2px' }}>
            {variantLabel}
          </p>
        )}
        <p style={{ fontSize: '12px', color: theme.textMuted }}>
          Qty: {item.quantity}
          {item.price != null && ` · ₹${Number(item.price).toFixed(2)} each`}
        </p>
      </div>

      {/* Subtotal */}
      <p style={{
        fontSize: '14px', fontWeight: 700,
        color: theme.primary,
        flexShrink: 0,
      }}>
        ₹{Number(item.subtotal).toFixed(2)}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ORDER CARD
// Collapsed: shows ID, date, total, badge, stepper
// Expanded: lazy-fetches /orders/:id and shows full detail
// ─────────────────────────────────────────────────────────────
function OrderCard({ order, theme }) {
  const [expanded,      setExpanded]      = useState(false)
  const [detail,        setDetail]        = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError,   setDetailError]   = useState(false)

  const badge = STATUS_BADGE[order.status] ?? fallbackBadge

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  // Lazy-fetch full order detail on first expand only
  async function handleToggle() {
    const next = !expanded
    setExpanded(next)

    if (next && !detail && !detailError) {
      setLoadingDetail(true)
      try {
        const data = await apiFetchOrderDetail(order.id)
        setDetail(data)
      } catch {
        setDetailError(true)
      } finally {
        setLoadingDetail(false)
      }
    }
  }

  return (
    <div style={{
      backgroundColor: theme.surface,
      border: `1px solid ${expanded ? theme.primary + '66' : theme.border}`,
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>

      {/* ── Collapsed header row ── */}
      <button
        onClick={handleToggle}
        style={{
          width: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', padding: '18px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Left: ID + badge + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '5px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: theme.textPrimary }}>
              Order #{order.id}
            </span>
            <span style={{
              display: 'inline-block',
              fontSize: '11px', fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '20px',
              backgroundColor: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.text,
              letterSpacing: '0.02em',
            }}>
              {badge.label}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: theme.textMuted }}>{formattedDate}</p>
        </div>

        {/* Right: total + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: theme.primary }}>
            ₹{Number(order.total).toFixed(2)}
          </span>
          <i
            className={`fa-solid fa-chevron-down`}
            style={{
              color: theme.textMuted, fontSize: '12px',
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {/* Status stepper — visible on collapsed card if order is in active flow */}
      {STATUS_FLOW.some(s => s.key === order.status) && (
        <StatusStepper status={order.status} theme={theme} />
      )}

      {/* ── Expanded detail section ── */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${theme.border}` }}>

          {loadingDetail && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <Spinner size={28} color={theme.primary} />
            </div>
          )}

          {detailError && (
            <p style={{ padding: '24px 20px', fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} />
              Failed to load order details.
            </p>
          )}

          {detail && !loadingDetail && (
            <div style={{ padding: '20px' }}>

              {/* Items list */}
              <p style={{
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: theme.textMuted, marginBottom: '2px',
              }}>
                Items
              </p>
              <div>
                {detail.items.map((item, idx) => (
                  <OrderItemRow key={idx} item={item} theme={theme} />
                ))}
              </div>

              {/* Totals */}
              <div style={{
                marginTop: '16px', paddingTop: '14px',
                borderTop: `1px solid ${theme.border}`,
                display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
                {detail.final_total != null && Number(detail.final_total) !== Number(order.total) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: theme.textMuted }}>Subtotal</span>
                    <span style={{ color: theme.textSecondary }}>₹{Number(order.total).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                  <span style={{ color: theme.textPrimary }}>Total Paid</span>
                  <span style={{ color: theme.primary }}>
                    ₹{Number(detail.final_total ?? order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Tracking — only shown when AWB is present */}
              {detail.shipping?.awb && (
                <div style={{
                  marginTop: '20px', paddingTop: '16px',
                  borderTop: `1px solid ${theme.border}`,
                }}>
                  <p style={{
                    fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: theme.textMuted, marginBottom: '10px',
                  }}>
                    Tracking
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <TrackRow label="Courier" value={detail.shipping.courier || '—'} theme={theme} />
                    <TrackRow label="AWB Number" value={detail.shipping.awb} theme={theme} mono />
                  </div>
                </div>
              )}

              {/* Shipping address */}
              {detail.address && (
                <div style={{
                  marginTop: '20px', paddingTop: '16px',
                  borderTop: `1px solid ${theme.border}`,
                }}>
                  <p style={{
                    fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: theme.textMuted, marginBottom: '10px',
                  }}>
                    Shipping Address
                  </p>
                  <div style={{
                    backgroundColor: theme.surfaceHover,
                    borderRadius: '10px',
                    padding: '14px 16px',
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary, marginBottom: '4px' }}>
                      {detail.address.name}
                    </p>
                    <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.6 }}>
                      {detail.address.phone}<br />
                      {detail.address.line1}
                      {detail.address.line2 ? `, ${detail.address.line2}` : ''}<br />
                      {detail.address.city}, {detail.address.state} — {detail.address.pincode}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Small helper for tracking rows
function TrackRow({ label, value, theme, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', gap: '12px' }}>
      <span style={{ color: theme.textMuted, flexShrink: 0 }}>{label}</span>
      <span style={{
        color: theme.textPrimary,
        fontFamily: mono ? 'monospace' : 'inherit',
        fontSize: mono ? '12px' : '13px',
        textAlign: 'right',
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyOrders({ theme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <i className="fa-solid fa-box-open" style={{ fontSize: '28px', color: theme.textMuted, opacity: 0.5 }} />
      </div>
      <h2 style={{
        fontSize: '1.4rem', fontWeight: 700,
        color: theme.textPrimary, marginBottom: '10px',
      }}>
        No orders yet
      </h2>
      <p style={{ fontSize: '14px', color: theme.textMuted, maxWidth: '300px', lineHeight: 1.6, marginBottom: '28px' }}>
        You haven't placed any orders yet. Start shopping to see your order history here.
      </p>
      <Link
        to="/home"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '12px 28px', borderRadius: '10px', border: 'none',
          background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
          color: '#ffffff', fontSize: '14px', fontWeight: 700,
          textDecoration: 'none', letterSpacing: '0.04em', textTransform: 'uppercase',
          boxShadow: `0 4px 20px ${theme.primary}44`,
        }}
      >
        <i className="fa-solid fa-bag-shopping" />
        Browse the Store
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN — Orders Page
// ─────────────────────────────────────────────────────────────
export default function Orders() {
  const { theme }          = useTheme()
  const { isAuthenticated } = useAuth()
  const navigate            = useNavigate()

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetchOrders()
      setOrders(data.orders ?? [])
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login', { state: { from: { pathname: '/orders' } } })
      } else {
        setError('Failed to load orders. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (isAuthenticated) fetchOrders()
  }, [isAuthenticated, fetchOrders])

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: theme.primary, marginBottom: '8px',
          }}>
            Account
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
            <h1 className="font-heading" style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900,
              color: theme.textPrimary, lineHeight: 1,
            }}>
              My Orders
            </h1>
            {!loading && orders.length > 0 && (
              <span style={{ fontSize: '13px', color: theme.textMuted, flexShrink: 0 }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spinner size={36} color={theme.primary} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '12px',
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: '14px', marginBottom: '20px',
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
            {error}
            <button
              onClick={fetchOrders}
              style={{
                marginLeft: 'auto', fontSize: '12px', fontWeight: 600,
                color: '#ef4444', background: 'none', border: 'none',
                cursor: 'pointer', textDecoration: 'underline', flexShrink: 0,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <EmptyOrders theme={theme} />
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} theme={theme} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
