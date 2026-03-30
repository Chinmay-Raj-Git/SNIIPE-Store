import { useState } from 'react'
import { useTheme } from '../../theme/ThemeContext'
import { useCart } from '../../hooks/useCart'
import { formatINR } from '../../utils/priceUtils'

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="250" viewBox="0 0 200 250"><rect width="200" height="250" fill="%23111"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="36" fill="%23333" text-anchor="middle" dy=".3em">✦</text></svg>'

/**
 * CartItem — displays a single cart item with quantity controls.
 *
 * Backend item shape from GET /cart:
 *   { id, product_name, variant_color, variant_size, quantity, price, subtotal, is_free_item }
 */
export default function CartItem({ item }) {
  const { theme } = useTheme()
  const { updateQuantity, removeItem } = useCart()
  const [removing, setRemoving] = useState(false)
  const [updatingQty, setUpdatingQty] = useState(false)

  async function handleQtyChange(newQty) {
    if (newQty < 1 || updatingQty || item.is_free_item) return
    setUpdatingQty(true)
    try { await updateQuantity(item.id, newQty) }
    finally { setUpdatingQty(false) }
  }

  async function handleRemove() {
    setRemoving(true)
    try { await removeItem(item.id) }
    catch { setRemoving(false) }
  }

  const isFree = item.is_free_item

  return (
    <div style={{
      display: 'flex', gap: '16px', padding: '20px 0',
      borderBottom: `1px solid ${theme.border}`,
      opacity: removing ? 0.4 : 1,
      transition: 'opacity 0.25s ease',
    }}>
      {/* Image */}
      <div style={{
        width: '88px', height: '110px', flexShrink: 0,
        borderRadius: '10px', overflow: 'hidden',
        backgroundColor: theme.surfaceHover,
        border: `1px solid ${theme.border}`,
      }}>
        <img
          src={item.thumbnail ?? PLACEHOLDER}
          alt={item.product_name}
          onError={e => { e.target.src = PLACEHOLDER }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{
            fontSize: '15px', fontWeight: 700, color: theme.textPrimary,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.product_name}
          </h3>
          {/* Remove button */}
          {!isFree && (
            <button onClick={handleRemove} disabled={removing} style={{
              flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
              color: theme.textMuted, padding: '2px 4px',
              fontSize: '14px', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
              title="Remove item"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Variant pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {item.variant_color && (
            <span style={pillStyle(theme)}>{item.variant_color}</span>
          )}
          {item.variant_size && (
            <span style={pillStyle(theme)}>{item.variant_size}</span>
          )}
          {isFree && (
            <span style={{ ...pillStyle(theme), backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.25)' }}>
              FREE
            </span>
          )}
        </div>

        {/* Price + qty row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            {isFree ? (
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>FREE</span>
            ) : (
              <span style={{ fontSize: '16px', fontWeight: 700, color: theme.primary }}>
                {formatINR(item.price * item.quantity)}
              </span>
            )}
            {item.quantity > 1 && !isFree && (
              <span style={{ fontSize: '12px', color: theme.textMuted, marginLeft: '6px' }}>
                {formatINR(item.price)} each
              </span>
            )}
          </div>

          {/* Quantity stepper */}
          {!isFree && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0',
              border: `1.5px solid ${theme.border}`,
              borderRadius: '8px', overflow: 'hidden',
            }}>
              <button onClick={() => handleQtyChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || updatingQty}
                style={stepperBtn(theme, item.quantity <= 1 || updatingQty)}>
                <i className="fa-solid fa-minus" style={{ fontSize: '10px' }} />
              </button>
              <span style={{
                minWidth: '32px', textAlign: 'center',
                fontSize: '14px', fontWeight: 700, color: theme.textPrimary,
                padding: '6px 4px',
                borderLeft: `1px solid ${theme.border}`,
                borderRight: `1px solid ${theme.border}`,
              }}>
                {updatingQty ? <i className="fa-solid fa-spinner" style={{ fontSize: '10px', animation: 'spin 0.7s linear infinite' }} /> : item.quantity}
              </span>
              <button onClick={() => handleQtyChange(item.quantity + 1)}
                disabled={updatingQty}
                style={stepperBtn(theme, updatingQty)}>
                <i className="fa-solid fa-plus" style={{ fontSize: '10px' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function pillStyle(theme) {
  return {
    fontSize: '11px', fontWeight: 600, padding: '3px 10px',
    borderRadius: '999px', border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceHover, color: theme.textSecondary,
    textTransform: 'capitalize',
  }
}

function stepperBtn(theme, disabled) {
  return {
    width: '32px', height: '32px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'none', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? theme.textMuted : theme.textPrimary,
    transition: 'background-color 0.15s',
    fontSize: '12px',
  }
}
