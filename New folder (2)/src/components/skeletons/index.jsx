import { useTheme } from '../../theme/ThemeContext'

/* ── Shared pulse style ────────────────────────────────────── */
function SkeletonBlock({ style }) {
  const { theme } = useTheme()
  return (
    <div style={{
      backgroundColor: theme.surface,
      borderRadius: '8px',
      animation: 'pulse 1.8s ease-in-out infinite',
      ...style,
    }} />
  )
}

/* ── Product card skeleton ──────────────────────────────────── */
export function ProductCardSkeleton() {
  const { theme } = useTheme()
  return (
    <div style={{
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <SkeletonBlock style={{ height: '320px', borderRadius: 0 }} />
      <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SkeletonBlock style={{ height: '16px', width: '70%' }} />
        <SkeletonBlock style={{ height: '20px', width: '40%' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1,2,3].map(i => <SkeletonBlock key={i} style={{ width: '12px', height: '12px', borderRadius: '50%' }} />)}
        </div>
      </div>
    </div>
  )
}

/* ── Product page skeleton ──────────────────────────────────── */
export function ProductPageSkeleton() {
  const { theme } = useTheme()
  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px' }}>
          <SkeletonBlock style={{ height: '600px', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SkeletonBlock style={{ height: '16px', width: '30%' }} />
            <SkeletonBlock style={{ height: '48px', width: '80%' }} />
            <SkeletonBlock style={{ height: '32px', width: '25%' }} />
            <SkeletonBlock style={{ height: '80px' }} />
            <SkeletonBlock style={{ height: '44px' }} />
            <SkeletonBlock style={{ height: '44px' }} />
            <SkeletonBlock style={{ height: '52px', marginTop: '8px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Generic grid skeleton (n cards) ────────────────────────── */
export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/* ── Cart row skeleton ──────────────────────────────────────── */
export function CartItemSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '20px 0' }}>
      <SkeletonBlock style={{ width: '88px', height: '110px', borderRadius: '10px', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
        <SkeletonBlock style={{ height: '16px', width: '60%' }} />
        <SkeletonBlock style={{ height: '12px', width: '40%' }} />
        <SkeletonBlock style={{ height: '28px', width: '100px', marginTop: 'auto' }} />
      </div>
    </div>
  )
}
