import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useProductDetail } from '../hooks/useProductDetail'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import ProductGallery from '../components/ProductGallery'
import ColorSelector from '../components/ColorSelector'
import SizeSelector from '../components/SizeSelector'
import StockBadge from '../components/StockBadge'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/skeletons'
import { getStockLevel } from '../utils/variantUtils'
import { formatINR } from '../utils/priceUtils'
import { fetchProducts, normalizeProducts } from '../api/productApi'

// ── Structured description parser (matches Flask product.html logic) ─────────
function parseDescription(raw) {
  if (!raw) return {}
  const upper = raw.toUpperCase()

  const descStart = upper.indexOf('DESCRIPTION')
  const featStart = upper.indexOf('FEATURES')
  const careStart = upper.indexOf('CARE')

  const section = (start, keyword, nextStart) => {
    if (start === -1) return ''
    return raw.slice(start + keyword.length, nextStart !== -1 ? nextStart : undefined).trim()
  }

  const descText = section(descStart, 'DESCRIPTION', featStart !== -1 ? featStart : careStart)
  const featText = section(featStart, 'FEATURES', careStart)
  const careText = section(careStart, 'CARE', -1)

  return { descText, featText, careText }
}

// ── Collapsible accordion ────────────────────────────────────
function Accordion({ title, children, defaultOpen = false, theme }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
          backgroundColor: theme.surface,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {title}
        </span>
        <i className="fa-solid fa-angle-down" style={{ color: theme.primary, fontSize: '12px', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
      </button>
      {open && (
        <div style={{ padding: '14px 18px', backgroundColor: theme.background, borderTop: `1px solid ${theme.border}` }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Quantity stepper ─────────────────────────────────────────
function QuantityInput({ value, onChange, max, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: `1.5px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        style={{ width: '38px', height: '38px', background: 'none', border: 'none', cursor: value <= 1 ? 'not-allowed' : 'pointer', color: value <= 1 ? theme.textMuted : theme.textPrimary, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (value > 1) e.currentTarget.style.backgroundColor = theme.surfaceHover }}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <i className="fa-solid fa-minus" style={{ fontSize: '10px' }} />
      </button>
      <span style={{ minWidth: '36px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: theme.textPrimary, borderLeft: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}`, padding: '8px 4px' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{ width: '38px', height: '38px', background: 'none', border: 'none', cursor: value >= max ? 'not-allowed' : 'pointer', color: value >= max ? theme.textMuted : theme.textPrimary, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (value < max) e.currentTarget.style.backgroundColor = theme.surfaceHover }}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <i className="fa-solid fa-plus" style={{ fontSize: '10px' }} />
      </button>
    </div>
  )
}

// ── Similar products section ─────────────────────────────────
function SimilarProducts({ category, currentId, theme }) {
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!category) { setLoading(false); return }
    fetchProducts()
      .then((raw) => {
        const all = normalizeProducts(raw)
        const filtered = all.filter((p) => p.category === category && String(p.id) !== String(currentId))
        setSimilar(filtered.slice(0, 4))
      })
      .catch(() => setSimilar([]))
      .finally(() => setLoading(false))
  }, [category, currentId])

  if (!loading && similar.length === 0) return null

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '56px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: theme.primary, marginBottom: '8px' }}>
          You May Also Like
        </p>
        <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: theme.textPrimary, marginBottom: '32px' }}>
          Similar Products
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : similar.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const { theme } = useTheme()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    product, loading, error,
    selectedColor, setSelectedColor,
    selectedSize, setSelectedSize,
    resolvedVariant, colors, sizes,
    activeImages, activeImageIndex, setActiveImageIndex,
  } = useProductDetail(id)

  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [showGoToCart, setShowGoToCart] = useState(false)
  const [cartError, setCartError] = useState('')
  const [sizeChartOpen, setSizeChartOpen] = useState(false)

  // Reset quantity when variant changes
  useEffect(() => { setQuantity(1) }, [resolvedVariant])

  if (loading) return <LoadingState theme={theme} />
  if (error || !product) return <ErrorState theme={theme} error={error} />

  const stock      = resolvedVariant?.stock ?? 0
  const stockLevel = getStockLevel(stock)
  const maxQty     = Math.max(1, stock)

  const parsed = parseDescription(product.description)
  const hasStructuredDesc = parsed.descText || parsed.featText || parsed.careText

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } })
      return
    }
    if (!resolvedVariant) {
      setCartError('Please select a color and size')
      return
    }
    setAddingToCart(true)
    setCartError('')
    try {
      await addToCart(product.id, resolvedVariant.id, quantity)
      setAddedFeedback(true)
      setShowGoToCart(true)
      setTimeout(() => setAddedFeedback(false), 2500)
      // Go-to-cart button visible for 8 seconds
      setTimeout(() => setShowGoToCart(false), 8000)
    } catch (e) {
      setCartError(e?.response?.data?.error ?? 'Failed to add to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  const ctaDisabled = stockLevel === 'OUT_OF_STOCK' || addingToCart

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div className="pp-breadcrumb" style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.surface, padding: '12px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textMuted }}>
          <Link to="/" style={{ color: theme.textMuted, textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = theme.primary} onMouseLeave={(e) => e.target.style.color = theme.textMuted}>Home</Link>
          <span>/</span>
          <Link to="/home" style={{ color: theme.textMuted, textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = theme.primary} onMouseLeave={(e) => e.target.style.color = theme.textMuted}>Shop</Link>
          <span>/</span>
          {product.category && <><span>{product.category}</span><span>/</span></>}
          <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="pp-wrap" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px 60px' }}>
        <div className="pp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '56px', alignItems: 'start' }}>

          {/* ── LEFT: Gallery ── */}
          <div>
            <ProductGallery images={activeImages} activeIndex={activeImageIndex} onIndexChange={setActiveImageIndex} productName={product.name} />
          </div>

          {/* ── RIGHT: Info panel ── */}
          <div className="pp-sticky" style={{ position: 'sticky', top: '120px' }}>

            {product.category && (
              <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: theme.primary, backgroundColor: theme.primaryMuted, border: `1px solid ${theme.primary}44`, padding: '3px 12px', borderRadius: '999px', marginBottom: '16px' }}>
                {product.category}
              </span>
            )}

            <h1 className="font-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: theme.textPrimary, lineHeight: 1.1, marginBottom: '16px' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: theme.primary, letterSpacing: '-0.01em' }}>
                {formatINR(product.price)}
              </span>
              <StockBadge stock={stock} size="md" showCount />
            </div>

            {/* Description — structured if possible, else raw */}
            {product.description && (
              <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${theme.border}` }}>
                {hasStructuredDesc ? (
                  <>
                    {parsed.descText && (
                      <Accordion title="Description" defaultOpen theme={theme}>
                        <p style={{ fontSize: '14px', lineHeight: 1.8, color: theme.textSecondary, whiteSpace: 'pre-line' }}>{parsed.descText}</p>
                      </Accordion>
                    )}
                    {parsed.featText && (
                      <Accordion title="Features" theme={theme}>
                        <p style={{ fontSize: '14px', lineHeight: 1.8, color: theme.textSecondary, whiteSpace: 'pre-line' }}>{parsed.featText}</p>
                      </Accordion>
                    )}
                    {parsed.careText && (
                      <Accordion title="Care &amp; Instructions" theme={theme}>
                        <p style={{ fontSize: '14px', lineHeight: 1.8, color: theme.textSecondary, whiteSpace: 'pre-line' }}>{parsed.careText}</p>
                      </Accordion>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: '14px', lineHeight: 1.75, color: theme.textSecondary }}>{product.description}</p>
                )}
              </div>
            )}

            {/* Variant selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '24px' }}>
              {colors.length > 0 && (
                <ColorSelector colors={colors} selectedColor={selectedColor} onChange={setSelectedColor} />
              )}
              {sizes.length > 0 && (
                <SizeSelector variants={product.variants} selectedColor={selectedColor} selectedSize={selectedSize} onChange={setSelectedSize} />
              )}
            </div>

            {/* Size Chart accordion
            <div style={{ marginBottom: '24px' }}>
              <Accordion title="Size Chart" theme={theme}>
                <table style={{ width: '100%', fontSize: '12px', color: theme.textSecondary, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                      {['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: theme.textPrimary, fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[['S','36–38','27','16'],['M','38–40','28','17'],['L','40–42','29','18'],['XL','42–44','30','18.5'],['XXL','44–46','31','19']].map(([s,c,l,sh]) => (
                      <tr key={s} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700, color: theme.primary }}>{s}</td>
                        <td style={{ padding: '6px 8px' }}>{c}</td>
                        <td style={{ padding: '6px 8px' }}>{l}</td>
                        <td style={{ padding: '6px 8px' }}>{sh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ marginTop: '10px', fontSize: '11px', color: theme.textMuted }}>
                  All measurements are in inches.
                </p>
              </Accordion>
            </div> */}

            {/* Resolved variant info */}
            {resolvedVariant && (
              <div style={{ fontSize: '12px', color: theme.textMuted, backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-info" style={{ color: theme.iconColor }} />
                {resolvedVariant.color && <span style={{ textTransform: 'capitalize' }}>{resolvedVariant.color}</span>}
                {resolvedVariant.color && resolvedVariant.size && <span>·</span>}
                {resolvedVariant.size && <span>{resolvedVariant.size}</span>}
                <span>·</span>
                <span>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
              </div>
            )}

            {/* Quantity selector */}
            {stockLevel !== 'OUT_OF_STOCK' && resolvedVariant && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: 600 }}>Qty:</span>
                <QuantityInput value={quantity} onChange={setQuantity} max={maxQty} theme={theme} />
                {quantity > 1 && (
                  <span style={{ fontSize: '13px', color: theme.textMuted }}>
                    = {formatINR(product.price * quantity)}
                  </span>
                )}
              </div>
            )}

            {/* Cart error */}
            {cartError && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-exclamation" /> {cartError}
              </div>
            )}

            {/* Add to Cart button */}
            {addedFeedback ? (
              <div style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                <i className="fa-solid fa-check" /> Added to Cart!
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={ctaDisabled}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: ctaDisabled ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.25s ease', background: ctaDisabled ? theme.surfaceHover : `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: ctaDisabled ? theme.textMuted : '#ffffff', boxShadow: !ctaDisabled ? `0 8px 24px ${theme.primary}44` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}
                onMouseEnter={(e) => { if (!ctaDisabled) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {addingToCart
                  ? <><BtnSpinner /> Adding…</>
                  : <><i className="fa-solid fa-bag-shopping" />{stockLevel === 'OUT_OF_STOCK' ? 'Out of Stock' : isAuthenticated ? 'Add to Cart' : 'Sign In to Add'}</>
                }
              </button>
            )}

            {/* Temporary "Go to Cart" button */}
            {showGoToCart && (
              <Link
                to="/cart"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', border: `1.5px solid ${theme.primary}`, color: theme.primary, backgroundColor: theme.primaryMuted, transition: 'all 0.2s', marginBottom: '12px', animation: 'fade-in-reveal 0.4s ease forwards' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.primary; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.primaryMuted; e.currentTarget.style.color = theme.primary }}
              >
                <i className="fa-solid fa-bag-shopping" />
                Go to Cart
              </Link>
            )}

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
              {[{ icon: 'fa-truck', text: 'Free Delivery' }, { icon: 'fa-rotate-left', text: '7-Day Returns' }, { icon: 'fa-shield-halved', text: 'Secure Checkout' }].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.textMuted }}>
                  <i className={`fa-solid ${icon}`} style={{ color: theme.iconColor, fontSize: '13px' }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Similar products */}
      <SimilarProducts category={product.category} currentId={id} theme={theme} />
    </div>
  )
}

function BtnSpinner() {
  return <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
}

function LoadingState({ theme }) {
  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px' }}>
          <div style={{ height: '600px', borderRadius: '16px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[60, 40, 80, 100, 60].map((w, i) => (
              <div key={i} style={{ height: i === 0 ? '40px' : '20px', width: `${w}%`, borderRadius: '6px', backgroundColor: theme.surface, animation: 'pulse 1.8s ease-in-out infinite' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ theme, error }) {
  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
      <h2 style={{ color: theme.textPrimary, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Product Not Found</h2>
      <p style={{ color: theme.textSecondary, marginBottom: '24px' }}>{error ?? 'This product does not exist.'}</p>
      <Link to="/home" style={{ padding: '12px 28px', backgroundColor: theme.primary, color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
        Back to Shop
      </Link>
    </div>
  )
}
