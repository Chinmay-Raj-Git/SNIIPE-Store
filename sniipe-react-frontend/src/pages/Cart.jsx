import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useCart } from '../hooks/useCart'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import CouponInput from '../components/cart/CouponInput'
import EmptyCart from '../components/cart/EmptyCart'
import { useCheckout } from '../hooks/useCheckout'
import { calcSubtotal } from '../utils/priceUtils'

export default function Cart() {
  const { theme } = useTheme()
  const { cartItems, loading, cartCount } = useCart()
  const { couponResult, couponLoading, applyCoupon, removeCoupon } = useCheckout()

  if (loading) return <CartSkeleton theme={theme} />
  if (!loading && cartCount === 0) return <EmptyCart />

  const subtotal = calcSubtotal(cartItems.map(i => ({ price: i.price, quantity: i.quantity })))

  return (
    <div className="cart-wrap" style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: theme.primary, marginBottom: '8px' }}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, color: theme.textPrimary, lineHeight: 1 }}>
            Your Cart
          </h1>
        </div>

        {/* Layout */}
        <div className="cart-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'start',
        }}>

          {/* LEFT — Cart items */}
          <div>
            <div style={{
              backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: '16px', padding: '8px 24px',
            }}>
              {cartItems.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Continue shopping */}
            <Link to="/home" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '20px', fontSize: '13px', color: theme.textMuted,
              textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.color = theme.primary}
              onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }} />
              Continue Shopping
            </Link>
          </div>

          {/* RIGHT — Summary */}
          <CartSummary
            subtotal={subtotal}
            couponResult={couponResult}
            ctaLabel="Proceed to Checkout →"
            ctaDisabled={cartCount === 0}
            onCta={() => window.location.href = '/checkout'}
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
    </div>
  )
}

function CartSkeleton({ theme }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ height: '40px', width: '200px', borderRadius: '8px', backgroundColor: theme.surface, marginBottom: '32px', animation: 'pulse 1.8s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '120px', borderRadius: '12px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ height: '320px', borderRadius: '16px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
      </div>
    </div>
  )
}
