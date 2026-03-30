import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/ProductGrid'

/**
 * CollectionProducts
 *
 * Route: /collections/:category
 *
 * Routing decision (Option A — new page):
 *   - Home/Shop page is NOT modified at all
 *   - useProducts() already fetches and normalizes the full product list
 *     including variants — we filter client-side, zero extra API calls
 *   - Uses existing ProductGrid + ProductCard components unchanged
 *   - Clean URL per collection, bookmarkable, shareable
 *
 * Category matching is case-insensitive to be robust against backend
 * variations (e.g. "Hoodies" vs "hoodies").
 */
export default function CollectionProducts() {
  const { category } = useParams()
  const { theme } = useTheme()

  const {
    products,
    loading,
    error,
    sortBy,
    setSortBy,
  } = useProducts()

  // Decode the URL param and filter client-side — no extra API call
  const decodedCategory = decodeURIComponent(category ?? '')

  const filtered = useMemo(() => {
    if (!decodedCategory) return products
    return products.filter(
      (p) => (p.category ?? '').toLowerCase() === decodedCategory.toLowerCase()
    )
  }, [products, decodedCategory])

  // Human-readable collection label — try to match COLLECTION_DEFS labels,
  // fall back to capitalised category name
  const LABEL_MAP = {
    'hoodies':      'Winter Wear',
    'oversized tees': 'Summer Wear',
    'womens':       "Women's Collection",
  }
  const displayLabel = LABEL_MAP[decodedCategory] ?? decodedCategory

  const SORT_OPTIONS = [
    { value: 'default',    label: 'Featured' },
    { value: 'price-asc',  label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'name',       label: 'Name A-Z' },
  ]

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.surface,
        padding: '40px 24px 32px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '12px', color: theme.textMuted,
            marginBottom: '16px',
          }}>
            <Link
              to="/"
              style={{ color: theme.textMuted, textDecoration: 'none' }}
              onMouseEnter={(e) => (e.target.style.color = theme.primary)}
              onMouseLeave={(e) => (e.target.style.color = theme.textMuted)}
            >
              Home
            </Link>
            <span>/</span>
            <Link
              to="/collections"
              style={{ color: theme.textMuted, textDecoration: 'none' }}
              onMouseEnter={(e) => (e.target.style.color = theme.primary)}
              onMouseLeave={(e) => (e.target.style.color = theme.textMuted)}
            >
              Collections
            </Link>
            <span>/</span>
            <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{displayLabel}</span>
          </div>

          <p style={{
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: theme.primary, marginBottom: '8px',
          }}>
            Collection
          </p>
          <h1
            className="font-heading"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              color: theme.textPrimary,
              lineHeight: 1,
            }}
          >
            {displayLabel}
          </h1>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.surface,
        position: 'sticky', top: '64px', zIndex: 20,
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          padding: '0 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Back link */}
          <Link
            to="/collections"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '12px 0', fontSize: '13px',
              color: theme.textMuted, textDecoration: 'none',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }} />
            All Collections
          </Link>

          {/* Count + sort */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '16px', flexShrink: 0, padding: '12px 0',
          }}>
            {!loading && (
              <span style={{ fontSize: '13px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              </span>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '7px 32px 7px 12px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
                cursor: 'pointer', outline: 'none', appearance: 'none',
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid — reuses existing ProductGrid + ProductCard unchanged */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <ProductGrid products={filtered} loading={loading} error={error} />
      </div>

    </div>
  )
}
