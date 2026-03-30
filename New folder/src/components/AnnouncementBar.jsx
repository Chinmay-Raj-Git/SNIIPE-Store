import { useTheme } from '../theme/ThemeContext'

const ANNOUNCEMENTS = [
  '🎉  BACK IN STOCK: Oversized Tees at ₹499 only!',
  '💎  FREE SHIPPING on all orders — No delivery charges.',
  '🔥  Buy 1 Hoodie at ₹2499 & Get 1 FREE',
  '⚡  Limited drops — once it\'s gone, it\'s gone!',
  '✨  New arrivals every Friday — Follow @sniipe',
]

/**
 * AnnouncementBar — global scrolling ticker bar.
 * Uses pure CSS marquee animation (no JS interval).
 * Duplicates items to create a seamless infinite loop.
 */
export default function AnnouncementBar() {
  const { theme } = useTheme()

  // Triple the items so the seamless loop works at all viewport widths
  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS]

  return (
    <div
      className="ticker-wrap"
      style={{
        backgroundColor: theme.announcementBg,
        color: theme.announcementText,
        padding: '9px 0',
        position: 'relative',
        zIndex: 40,
      }}
    >
      <div className="ticker-track" aria-hidden="true">
        {items.map((msg, i) => (
          <span
            key={i}
            style={{
              padding: '0 40px',
              fontSize: '12.5px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
