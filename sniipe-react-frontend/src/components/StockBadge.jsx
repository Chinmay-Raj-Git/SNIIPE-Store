import { useTheme } from '../theme/ThemeContext'
import { getStockLevel } from '../utils/variantUtils'

/**
 * StockBadge
 *
 * Displays a styled badge based on the stock number:
 *   0        → OUT OF STOCK  (red)
 *   1–4      → LOW STOCK     (amber)
 *   5+       → IN STOCK      (green)
 *
 * @param {number}  stock   - stock count
 * @param {string}  size    - 'sm' | 'md' (default 'md')
 * @param {boolean} showCount - show exact count for low stock
 */
export default function StockBadge({ stock, size = 'md', showCount = false }) {
  const { theme } = useTheme()
  const level = getStockLevel(stock ?? 0)

  const config = {
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      dot: '#ef4444',
      bg: 'rgba(239,68,68,0.12)',
      text: '#ef4444',
      border: 'rgba(239,68,68,0.25)',
    },
    LOW_STOCK: {
      label: showCount ? `Only ${stock} left` : 'Low Stock',
      dot: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
      text: '#f59e0b',
      border: 'rgba(245,158,11,0.25)',
    },
    IN_STOCK: {
      label: 'In Stock',
      dot: '#22c55e',
      bg: 'rgba(34,197,94,0.12)',
      text: '#22c55e',
      border: 'rgba(34,197,94,0.25)',
    },
  }

  const { label, dot, bg, text, border } = config[level]

  const padding   = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize  = size === 'sm' ? '10px' : '12px'
  const dotSize   = size === 'sm' ? '6px' : '7px'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: text,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '999px',
      }}
    >
      {/* Pulsing dot for low stock */}
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: dot,
          flexShrink: 0,
          animation: level === 'LOW_STOCK' ? 'pulse 2s infinite' : 'none',
        }}
      />
      {label}
    </span>
  )
}
