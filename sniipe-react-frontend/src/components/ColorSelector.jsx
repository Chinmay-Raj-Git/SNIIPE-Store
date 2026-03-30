import { useTheme } from '../theme/ThemeContext'

/**
 * Map of color names → hex for swatch display.
 * Extend this as needed for your catalog.
 */
const COLOR_HEX = {
  black: '#1c1c1c', white: '#f5f5f5', red: '#d63031',
  blue: '#0984e3', navy: '#1a365d', green: '#ADDE7A',
  yellow: '#fdcb6e', orange: '#e17055', purple: '#a29bfe',
  pink: '#fd79a8', grey: '#636e72', gray: '#636e72',
  brown: '#c19a6b', dark_brown: '#8B4513', beige: '#d6cbb5', cream: '#fffdd0',
  maroon: '#800000', teal: '#008080', olive: '#808000',
  khaki: '#c3b091', charcoal: '#36454f', coral: '#ff7f7f',
  mint: '#98ff98', lavender: '#e6e6fa', tan: '#d2b48c',
  camel: '#c19a6b', ivory: '#fffff0', sand: '#c2b280',
}

function getColorHex(name) {
  return COLOR_HEX[name?.toLowerCase()] ?? '#888'
}

/**
 * ColorSelector
 *
 * Displays clickable color swatches.
 * Shows a checkmark on selected color.
 *
 * @param {string[]} colors         - available color names
 * @param {string}   selectedColor  - currently selected
 * @param {fn}       onChange       - called with new color name
 */
export default function ColorSelector({ colors, selectedColor, onChange }) {
  const { theme } = useTheme()

  if (!colors || colors.length === 0) return null

  // If only one color with no meaningful name, don't show
  if (colors.length === 1 && !colors[0]) return null

  return (
    <div>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: theme.textSecondary,
          }}
        >
          Color
        </span>
        {selectedColor && (
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: theme.textPrimary,
              textTransform: 'capitalize',
            }}
          >
            — {selectedColor}
          </span>
        )}
      </div>

      {/* Swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {colors.map((color) => {
          const hex      = getColorHex(color)
          const isSelected = selectedColor === color
          const isLight  = isLightColor(hex)

          return (
            <button
              key={color}
              onClick={() => onChange?.(color)}
              title={color}
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: hex,
                border: isSelected
                  ? `3px solid ${theme.primary}`
                  : `2px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isSelected ? `0 0 0 3px ${theme.background}, 0 0 0 5px ${theme.primary}` : 'none',
                padding: 0,
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isSelected && (
                <i
                  className="fa-solid fa-check"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: isLight ? '#333' : '#fff',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Determines if a hex color is visually light (for icon contrast). */
function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
