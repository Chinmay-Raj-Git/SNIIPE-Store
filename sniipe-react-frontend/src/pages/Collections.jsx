import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { fetchProductsWithVariants, normalizeProducts } from '../api/productApi'

/**
 * Collections page
 *
 * Shows a grid of collection cards — one per product category derived from the
 * live product data. This keeps the page in sync with the backend automatically.
 *
 * We also include the three hardcoded "brand" collections as a baseline so the
 * page always has content even when filtering the live data.
 *
 * Routing decision: each card navigates to /collections/:category which is a
 * separate page (Option A). This keeps Home/Shop completely untouched, avoids
 * conditional logic inside existing pages, and gives collections a clean URL.
 */

// Hardcoded collection definitions — extend as needed.
// `category` must match what the backend returns in product.category.
const COLLECTION_DEFS = [
  {
    key: 'hoodies',
    label: 'Winter Wear',
    subtitle: 'Hoodies & Sweatshirts',
    category: 'hoodies',
    icon: 'fa-snowflake',
    gradient: ['#1e3a5f', '#2563eb'],
  },
  {
    key: 'Oversized',
    label: 'Summer Wear',
    subtitle: 'Oversized Tees',
    category: 'Oversized',
    icon: 'fa-sun',
    gradient: ['#7c2d12', '#ea580c'],
  },
  {
    key: 'Kurtis',
    label: "Women's Collection",
    subtitle: 'Designed for her',
    category: 'Kurtis',
    icon: 'fa-star',
    gradient: ['#4a1942', '#a855f7'],
  },
]

// ── Collection card ─────────────────────────────────────────
function CollectionCard({ def, productCount, thumbnail, theme }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/collections/${encodeURIComponent(def.category)}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="coll-card"
      style={{
        display: 'block',
        borderRadius: '20px',
        overflow: 'hidden',
        border: `1px solid ${hovered ? theme.primary + '88' : theme.border}`,
        textDecoration: 'none',
        position: 'relative',
        aspectRatio: '4/5',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.4), 0 0 0 1px ${theme.primary}22`
          : '0 4px 16px rgba(0,0,0,0.2)',
        backgroundColor: theme.surface,
      }}
    >
      {/* Background — product image or gradient fallback */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={def.label}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            transition: 'transform 0.5s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${def.gradient[0]}, ${def.gradient[1]})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i
            className={`fa-solid ${def.icon}`}
            style={{ fontSize: '64px', color: 'rgba(255,255,255,0.15)' }}
          />
        </div>
      )}

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: thumbnail
          ? 'linear-gradient(to top, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.2) 100%)'
          : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '28px 24px',
      }}>
        {/* Icon badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(6px)',
          marginBottom: '12px',
        }}>
          <i className={`fa-solid ${def.icon}`} style={{ color: '#fff', fontSize: '15px' }} />
        </div>

        <h3
          className="font-heading"
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2rem)',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '4px',
            letterSpacing: '-0.01em',
          }}
        >
          {def.label}
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '12px' }}>
          {def.subtitle}
        </p>

        {/* CTA row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          opacity: hovered ? 1 : 0.7,
          transition: 'opacity 0.2s',
        }}>
          <span style={{
            fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            Shop Now
            <i
              className="fa-solid fa-arrow-right"
              style={{
                fontSize: '10px',
                transition: 'transform 0.2s',
                transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              }}
            />
          </span>
          {productCount != null && (
            <span style={{
              fontSize: '11px', fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
            }}>
              {productCount} {productCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Main page ───────────────────────────────────────────────
export default function Collections() {
  const { theme } = useTheme()
  const [productsByCategory, setProductsByCategory] = useState({})
  const [loading, setLoading] = useState(true)

  // Load products once to derive per-category counts and thumbnails.
  // No additional API calls — reuses fetchProductsWithVariants already
  // called on Home/Landing.
  useEffect(() => {
    fetchProductsWithVariants()
      .then((raw) => {
        const products = normalizeProducts(raw)
        const map = {}
        for (const p of products) {
          const cat = (p.category ?? '').toLowerCase()
          if (!map[cat]) map[cat] = { count: 0, thumbnail: null }
          map[cat].count++
          if (!map[cat].thumbnail && p.thumbnail) map[cat].thumbnail = p.thumbnail
        }
        setProductsByCategory(map)
      })
      .catch(() => setProductsByCategory({}))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>

      {/* Page header */}
      <div className="collections-header" style={{
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.surface,
        padding: '24px 16px 24px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: theme.primary, marginBottom: '8px',
          }}>
            Browse
          </p>
          <h1
            className="font-heading"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              color: theme.textPrimary,
              lineHeight: 1,
              marginBottom: '10px',
            }}
          >
            Collections
          </h1>
          <p style={{ fontSize: '15px', color: theme.textSecondary, maxWidth: '480px' }}>
            Explore our curated drops by style. Each collection tells its own story.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="collections-wrap" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px 80px' }}>
        {loading ? (
          /* Skeleton */
          <div className="coll-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
          }}>
            {COLLECTION_DEFS.map((def) => (
              <div
                key={def.key}
                style={{
                  borderRadius: '20px',
                  aspectRatio: '4/5',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  animation: 'pulse 1.8s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : (
          <div className="coll-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
          }}>
            {COLLECTION_DEFS.map((def) => {
              const catKey = def.category.toLowerCase()
              const catData = productsByCategory[catKey]
              return (
                <CollectionCard
                  key={def.key}
                  def={def}
                  productCount={catData?.count ?? null}
                  thumbnail={catData?.thumbnail ?? null}
                  theme={theme}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
