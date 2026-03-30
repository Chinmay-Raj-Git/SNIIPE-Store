import { useParams } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'

export default function Product() {
  const { id } = useParams()
  const { theme } = useTheme()

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <p
        className="text-xs font-semibold tracking-[0.4em] uppercase mb-3"
        style={{ color: theme.primary }}
      >
        Coming in Phase 2
      </p>
      <h1
        className="font-heading text-6xl font-bold mb-4"
        style={{ color: theme.textPrimary }}
      >
        Product Detail
      </h1>
      <p style={{ color: theme.textSecondary }}>
        Product ID: <span style={{ color: theme.primary }}>{id}</span> — Full detail page with
        size selection, add to cart, and image gallery in Phase 2.
      </p>
    </div>
  )
}
