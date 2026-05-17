import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useCart } from '../hooks/useCart'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import CouponInput from '../components/cart/CouponInput'
import EmptyCart from '../components/cart/EmptyCart'
import { useCheckout } from '../hooks/useCheckout'
import { calcSubtotal } from '../utils/priceUtils'
import { formatINR } from '../utils/priceUtils'

export default function Cart() {
  const { theme } = useTheme()
  const { cartItems, loading, cartCount } = useCart()
  const { couponResult, couponLoading, applyCoupon, removeCoupon } = useCheckout()

  if (loading) return <CartSkeleton theme={theme} />
  if (!loading && cartCount === 0) return <EmptyCart />

  const subtotal = calcSubtotal(cartItems.map(i => ({ price: i.price, quantity: i.quantity })))
  const discount = couponResult ? parseFloat(couponResult.discount_amount ?? 0) : 0
  const total = couponResult ? parseFloat(couponResult.final_total) : Math.max(0, subtotal - discount)

  return (
    <div className="cart-wrap" style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '24px 16px 120px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: theme.primary, marginBottom: '6px' }}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: theme.textPrimary, lineHeight: 1 }}>
            Your Cart
          </h1>
        </div>

        {/* Layout — stacks on mobile */}
        <div className="cart-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}>

          {/* Cart items */}
          <div>
            <div style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '8px 16px' }}>
              {cartItems.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px', color: theme.textMuted, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = theme.primary}
              onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }} />
              Continue Shopping
            </Link>
          </div>

          {/* Summary — hidden on mobile; sticky bar handles checkout */}
          <div className="cart-summary-desktop">
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

      {/* ── Mobile sticky checkout bar ── */}
      <div className="cart-sticky-bar" style={{
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
          onClick={() => window.location.href = '/checkout'}
          disabled={cartCount === 0}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: '#fff', boxShadow: `0 4px 16px ${theme.primary}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <i className="fa-solid fa-lock" style={{ fontSize: '12px' }} />
          Checkout →
        </button>
      </div>
    </div>
  )
}

function CartSkeleton({ theme }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ height: '40px', width: '200px', borderRadius: '8px', backgroundColor: theme.surface, marginBottom: '24px', animation: 'pulse 1.8s ease-in-out infinite' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '120px', borderRadius: '12px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  )
}
