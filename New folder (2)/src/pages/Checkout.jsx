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
import { calcSubtotal } from '../utils/priceUtils'
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

  // Auto-select default address when addresses load
  const effectiveAddressId = selectedAddressId
    ?? defaultAddress?.id
    ?? addresses[0]?.id
    ?? null

  if (cartLoading) return <LoadingPage theme={theme} />
  if (!cartLoading && cartCount === 0) return <EmptyCart />

  const subtotal = calcSubtotal(cartItems.map(i => ({ price: i.price, quantity: i.quantity })))

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
    <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link to="/cart" style={{ color: theme.textMuted, textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
              onMouseEnter={e => e.currentTarget.style.color = theme.primary}
              onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }} /> Back to Cart
            </Link>
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: theme.primary, marginBottom: '8px' }}>
            Checkout
          </p>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, color: theme.textPrimary, lineHeight: 1 }}>
            Delivery Details
          </h1>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '10px',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontSize: '14px', marginBottom: '24px',
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', padding: '0 4px' }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        {/* Phone warning */}
        {!user?.phone && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '10px',
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            color: '#f59e0b', fontSize: '13px', marginBottom: '24px',
          }}>
            <i className="fa-solid fa-triangle-exclamation" />
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
          gap: '40px', alignItems: 'start',
        }}>

          {/* LEFT — Addresses */}
          <div>
            <h2 style={{
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: theme.textSecondary,
              marginBottom: '16px',
            }}>
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

          {/* RIGHT — Summary + Pay */}
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

        {/* Razorpay branding */}
        <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: theme.textMuted }}>
          <i className="fa-solid fa-lock" style={{ marginRight: '5px', color: theme.iconColor }} />
          Payments secured by Razorpay
        </p>
      </div>
    </div>
  )
}

function LoadingPage({ theme }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ height: '40px', width: '240px', borderRadius: '8px', backgroundColor: theme.surface, marginBottom: '32px', animation: 'pulse 1.8s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div style={{ height: '300px', borderRadius: '12px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
        <div style={{ height: '300px', borderRadius: '16px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
      </div>
    </div>
  )
}
