import { useState } from 'react'
import { useTheme } from '../theme/ThemeContext'
import { useCart } from '../hooks/useCart'
import { useAddresses } from '../hooks/useAddresses'
import { useCheckout } from '../hooks/useCheckout'
import { useAuth } from '../hooks/useAuth'
import CartSummary from '../components/cart/CartSummary'
import CouponInput from '../components/cart/CouponInput'
import AddressSelector from '../components/checkout/AddressSelector'
import EmptyCart from '../components/cart/EmptyCart'
import { calcSubtotal, formatINR } from '../utils/priceUtils'
import { Link } from 'react-router-dom'

export default function Checkout() {
  const { theme }  = useTheme()
  const { user }   = useAuth()
  const { cartItems, loading: cartLoading, cartCount } = useCart()
  const {
    addresses, loading: addrLoading, addAddress, deleteAddress,
    defaultAddress,
  } = useAddresses()

  const {
    processing, error, setError,
    couponResult, couponLoading, applyCoupon, removeCoupon,
    initiateCheckout,
  } = useCheckout()

  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addingAddress, setAddingAddress]          = useState(false)
  const [deletingId, setDeletingId]                = useState(null)

  const effectiveAddressId = selectedAddressId
    ?? defaultAddress?.id
    ?? addresses[0]?.id
    ?? null

  if (cartLoading) return <LoadingPage theme={theme} />
  if (!cartLoading && cartCount === 0) return <EmptyCart />

  const subtotal = calcSubtotal(cartItems.map(i => ({ price: i.price, quantity: i.quantity })))
  const discount = couponResult ? parseFloat(couponResult.discount_amount ?? 0) : 0
  const total = couponResult ? parseFloat(couponResult.final_total) : Math.max(0, subtotal - discount)

  async function handleAddAddress(form) {
    setAddingAddress(true)
    try { await addAddress(form) }
    finally { setAddingAddress(false) }
  }

  async function handleDeleteAddress(id) {
    setDeletingId(id)
    try { await deleteAddress(id) }
    finally { setDeletingId(null) }
  }

  async function handlePayNow() {
    if (!effectiveAddressId) {
      setError('Please add or select a delivery address')
      return
    }
    if (!user?.phone) {
      setError('Please add your phone number in your profile before checkout')
      return
    }
    await initiateCheckout({
      addressId: effectiveAddressId,
      couponCode: couponResult?.coupon_code ?? '',
      theme,
    })
  }

  const canPay = effectiveAddressId && !processing && !cartLoading

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '24px 16px 160px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link to="/cart" style={{ color: theme.textMuted, textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
              onMouseEnter={e => e.currentTarget.style.color = theme.primary}
              onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }} /> Back to Cart
            </Link>
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: theme.primary, marginBottom: '6px' }}>
            Checkout
          </p>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: theme.textPrimary, lineHeight: 1 }}>
            Delivery Details
          </h1>
        </div>

        {/* Fixed-position error alert */}
        {error && (
          <div style={{
            position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: '600px',
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '10px',
            backgroundColor: 'rgba(239,68,68,0.95)',
            border: '1px solid rgba(239,68,68,0.5)',
            color: '#fff', fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '18px', padding: '0 4px' }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        {/* Phone warning */}
        {!user?.phone && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px',
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            color: '#f59e0b', fontSize: '13px', marginBottom: '20px',
          }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: 0 }} />
            <span>
              Please{' '}
              <Link to="/profile" style={{ color: '#f59e0b', fontWeight: 700 }}>add your phone number</Link>
              {' '}before completing payment.
            </span>
          </div>
        )}

        {/* Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px', alignItems: 'start',
        }}>

          {/* LEFT — Addresses */}
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '16px' }}>
              Delivery Address
            </h2>

            {addrLoading ? (
              <div style={{ height: '120px', borderRadius: '12px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
            ) : (
              <AddressSelector
                addresses={addresses}
                selectedId={effectiveAddressId}
                onSelect={setSelectedAddressId}
                onAdd={handleAddAddress}
                addLoading={addingAddress}
                onDelete={handleDeleteAddress}
                deleteLoading={deletingId}
              />
            )}
          </div>

          {/* RIGHT — Summary (desktop only, sticky bar handles mobile) */}
          <div className="checkout-summary-desktop">
            <CartSummary
              subtotal={subtotal}
              couponResult={couponResult}
              ctaLabel={processing ? 'Processing…' : 'Pay Now →'}
              ctaDisabled={!canPay}
              ctaLoading={processing}
              onCta={handlePayNow}
              extra={
                <CouponInput
                  onApply={applyCoupon}
                  onRemove={removeCoupon}
                  applied={couponResult}
                  loading={couponLoading}
                />
              }
            />
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: theme.textMuted }}>
          <i className="fa-solid fa-lock" style={{ marginRight: '5px', color: theme.iconColor }} />
          Payments secured by Razorpay
        </p>
      </div>

      {/* ── Mobile sticky pay bar ── */}
      <div className="checkout-sticky-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.navBg,
        borderTop: `1px solid ${theme.border}`,
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center', gap: '12px',
        zIndex: 40,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0, lineHeight: 1 }}>Total</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: theme.primary, margin: 0 }}>{formatINR(total)}</p>
        </div>
        <button
          onClick={handlePayNow}
          disabled={!canPay}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: !canPay ? 'not-allowed' : 'pointer', border: 'none', background: !canPay ? theme.surfaceHover : `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: !canPay ? theme.textMuted : '#fff', boxShadow: canPay ? `0 4px 16px ${theme.primary}44` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {processing
            ? <><BtnSpinner /> Processing…</>
            : <><i className="fa-solid fa-lock" style={{ fontSize: '12px' }} /> Pay Now →</>
          }
        </button>
      </div>
    </div>
  )
}

function BtnSpinner() {
  return <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
}

function LoadingPage({ theme }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ height: '40px', width: '240px', borderRadius: '8px', backgroundColor: theme.surface, marginBottom: '24px', animation: 'pulse 1.8s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ height: '300px', borderRadius: '12px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
        <div style={{ height: '300px', borderRadius: '16px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
      </div>
    </div>
  )
}
