import { useTheme } from '../theme/ThemeContext'
import { colorNameToHex, isLightColor } from '../utils/colorMap'

// Color hex lookup now imported from utils/colorMap.js (single source of truth)
function getColorHex(name) {
  return colorNameToHex(name)
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
              className="color-pill-swatch"
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

