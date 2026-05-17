import { useRef } from 'react'
import { useTheme } from '../theme/ThemeContext'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/ProductGrid'

export default function Home() {
  const { theme } = useTheme()
  const {
    filtered, loading, error,
    search, setSearch,
    category, setCategory,
    sortBy, setSortBy,
    categories,
  } = useProducts()

  const SORT_OPTIONS = [
    { value: 'default',    label: 'Featured' },
    { value: 'price-asc',  label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'name',       label: 'Name A-Z' },
  ]

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>

      {/* Page header */}
      <div className="shop-header" style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.surface, padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: theme.primary, marginBottom: '8px' }}>
            Browse
          </p>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: theme.textPrimary, lineHeight: 1, marginBottom: '24px' }}>
            Shop All
          </h1>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '440px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '14px' }} />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', backgroundColor: theme.background, border: `1px solid ${theme.border}`, borderRadius: '10px', color: theme.textPrimary, fontSize: '14px', outline: 'none' }}
              onFocus={(e) => (e.target.style.borderColor = theme.primary)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '14px' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.surface, position: 'sticky', top: '64px', zIndex: 20 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '12px 0' }}>
            {categories.map((cat) => {
              const isActive = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{ flexShrink: 0, padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: isActive ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s ease', border: `1px solid ${isActive ? theme.primary : theme.border}`, backgroundColor: isActive ? theme.primary : 'transparent', color: isActive ? '#ffffff' : theme.textSecondary, whiteSpace: 'nowrap' }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Count + sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, paddingBottom: '12px' }}>
            {!loading && (
              <span style={{ fontSize: '13px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              </span>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '7px 32px 7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, backgroundColor: theme.background, border: `1px solid ${theme.border}`, color: theme.textPrimary, cursor: 'pointer', outline: 'none', appearance: 'none' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="shop-grid-wrap" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <ProductGrid products={filtered} loading={loading} error={error} />
      </div>
    </div>
  )
}
