import { useState } from 'react'
import { colorNameToHex } from '../utils/colorMap'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import StockBadge from './StockBadge'

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23111"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="48" fill="%23333" text-anchor="middle" dy=".3em">✦</text></svg>'

/**
 * ProductCard
 *
 * Displays a single product in the grid.
 * Handles hover image swap if product has multiple images.
 *
 * @param {Object} product - normalized product object
 */
export default function ProductCard({ product }) {
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(false)

  const primaryImg  = product.thumbnail ?? product.images?.[0]?.url ?? null
  const secondaryImg = product.images?.[1]?.url ?? null 

  // If variants are loaded (detail page), calculate from them.
  // If variants are empty (list page), trust the backend is_out_of_stock flag directly.
  const hasVariants = (product.variants ?? []).length > 0
  const totalStock = hasVariants
    ? (product.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0)
    : null
  const outOfStock = product.isOutOfStock || (totalStock !== null && totalStock === 0)

  return (
    <Link
      to={`/product/${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: theme.surface,
        borderColor: hovered ? theme.primary + '88' : theme.border,
        display: 'block',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px ${theme.primary}22`
          : '0 2px 8px rgba(0,0,0,0.15)',
        textDecoration: 'none',
      }}
    >
      {/* Image area */}
      <div
        className="pc-image"
        style={{
          position: 'relative',
          height: '320px',
          overflow: 'hidden',
          backgroundColor: theme.surfaceHover,
        }}
      >
        {/* Primary image */}
        <img
          src={primaryImg ?? PLACEHOLDER}
          alt={product.name}
          onError={(e) => { e.target.src = PLACEHOLDER }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: 'opacity 0.4s ease, transform 0.5s ease',
            opacity: hovered && secondaryImg ? 0 : 1,
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            position: 'absolute',
            inset: 0,
          }}
        />

        {/* Secondary image (hover swap) */}
        {secondaryImg && (
          <img
            src={secondaryImg}
            alt={`${product.name} alt view`}
            onError={(e) => { e.target.src = PLACEHOLDER }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transition: 'opacity 0.4s ease',
              opacity: hovered ? 1 : 0,
              position: 'absolute',
              inset: 0,
            }}
          />
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.7))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#ef4444',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                border: '1px solid rgba(239,68,68,0.4)',
                padding: '6px 16px',
                borderRadius: '6px',
                background: 'rgba(239,68,68,0.08)',
              }}
            >
              Out of Stock
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: theme.announcementText,
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              padding: '3px 10px',
              borderRadius: '999px',
              border: `1px solid rgba(255,255,255,0.1)`,
            }}
          >
            {product.category}
          </span>
        )}

        {/* Quick view hint on hover */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.25s ease',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#ffffff',
            }}
          >
            View Details →
          </span>
        </div>
      </div>

      {/* Info area */}
      <div className="pc-info" style={{ padding: '16px 18px 20px' }}>
        {/* Name */}
        <h3
          className="pc-name"
          style={{
            color: theme.textPrimary,
            fontSize: '15px',
            fontWeight: 600,
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {product.name}
        </h3>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <p
            className="pc-price"
            style={{
              color: theme.primary,
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          {/* Stock badge — only show out-of-stock or low-stock on card */}
          {outOfStock ? (
            <StockBadge stock={0} size="sm" />
          ) : totalStock !== null && totalStock < 5 ? (
            <StockBadge stock={totalStock} size="sm" showCount />
          ) : null}
        </div>

        {/* Color availability pills — computed from variants, no extra API calls */}
        {(() => {
          const variants = product.variants ?? []
          if (variants.length === 0) return null

          // Compute per-color stock totals
          const colorMap = {}
          for (const v of variants) {
            if (!v.color) continue
            colorMap[v.color] = (colorMap[v.color] ?? 0) + (v.stock ?? 0)
          }
          const colorEntries = Object.entries(colorMap)
          if (colorEntries.length === 0) return null

          return (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
              {colorEntries.slice(0, 5).map(([color, stock]) => {
                const oos = stock === 0
                return (
                  <span
                    key={color}
                    title={oos ? `${color} — Out of stock` : color}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '10px', fontWeight: 600,
                      padding: '2px 7px', borderRadius: '999px',
                      border: `1px solid ${oos ? theme.border : theme.primary + '55'}`,
                      backgroundColor: oos ? 'transparent' : theme.primaryMuted,
                      color: oos ? theme.textMuted : theme.primary,
                      opacity: oos ? 0.5 : 1,
                      textTransform: 'capitalize',
                      textDecoration: oos ? 'line-through' : 'none',
                    }}
                  >
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      backgroundColor: colorNameToHex(color),
                      border: '1px solid rgba(255,255,255,0.15)',
                      flexShrink: 0, opacity: oos ? 0.4 : 1,
                    }} />
                    {color}
                  </span>
                )
              })}
              {colorEntries.length > 5 && (
                <span style={{ fontSize: '10px', color: theme.textMuted, alignSelf: 'center' }}>
                  +{colorEntries.length - 5}
                </span>
              )}
            </div>
          )
        })()}
      </div>
    </Link>
  )
}

