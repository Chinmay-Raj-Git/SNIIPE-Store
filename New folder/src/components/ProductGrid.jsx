import { useTheme } from '../theme/ThemeContext'
import ProductCard from './ProductCard'

/**
 * ProductGrid
 *
 * Responsive product grid with empty/loading/error states.
 *
 * @param {Array}   products - normalized product array
 * @param {boolean} loading
 * @param {string}  error
 */
export default function ProductGrid({ products, loading, error }) {
  const { theme } = useTheme()

  // Loading skeleton
  if (loading) {
    return (
      <div
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} theme={theme} />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <i
          className="fa-solid fa-circle-exclamation"
          style={{ fontSize: '40px', color: '#ef4444', marginBottom: '16px', display: 'block' }}
        />
        <p style={{ color: theme.textSecondary, fontSize: '16px' }}>{error}</p>
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <i
          className="fa-solid fa-shirt"
          style={{ fontSize: '48px', color: theme.textMuted, marginBottom: '20px', display: 'block', opacity: 0.3 }}
        />
        <p style={{ color: theme.textSecondary, fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          No products found
        </p>
        <p style={{ color: theme.textMuted, fontSize: '14px' }}>
          Try adjusting your filters or search term.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '24px',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function SkeletonCard({ theme }) {
  return (
    <div
      style={{
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '320px',
          backgroundColor: theme.surfaceHover,
          animation: 'pulse 1.8s ease-in-out infinite',
        }}
      />
      <div style={{ padding: '16px 18px 20px' }}>
        <div
          style={{
            height: '16px',
            width: '70%',
            backgroundColor: theme.surfaceHover,
            borderRadius: '6px',
            marginBottom: '10px',
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: '14px',
            width: '40%',
            backgroundColor: theme.surfaceHover,
            borderRadius: '6px',
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}
