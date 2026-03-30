import { useTheme } from '../theme/ThemeContext'
import { getSizesForColor } from '../utils/variantUtils'

/**
 * SizeSelector
 *
 * Displays size chips. Out-of-stock sizes are faded and disabled.
 *
 * @param {Array}       variants      - product.variants
 * @param {string|null} selectedColor - for stock-per-color filtering
 * @param {string|null} selectedSize  - currently selected
 * @param {fn}          onChange      - called with new size string
 */
export default function SizeSelector({ variants, selectedColor, selectedSize, onChange }) {
  const { theme } = useTheme()

  const sizes = getSizesForColor(variants, selectedColor)
  if (sizes.length === 0) return null

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
          Size
        </span>
        {selectedSize && (
          <span style={{ fontSize: '13px', fontWeight: 500, color: theme.textPrimary }}>
            — {selectedSize}
          </span>
        )}
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {sizes.map(({ size, inStock }) => {
          const isSelected  = selectedSize === size
          const isDisabled  = !inStock

          return (
            <button
              key={size}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange?.(size)}
              title={isDisabled ? `${size} — Out of stock` : size}
              style={{
                minWidth: '48px',
                height: '44px',
                padding: '0 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',

                // Selected
                backgroundColor: isSelected ? theme.primary : 'transparent',
                color: isSelected
                  ? '#ffffff'
                  : isDisabled
                  ? theme.textMuted
                  : theme.textPrimary,
                border: isSelected
                  ? `2px solid ${theme.primary}`
                  : isDisabled
                  ? `2px solid ${theme.border}`
                  : `2px solid ${theme.border}`,
                opacity: isDisabled ? 0.45 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.borderColor = theme.primary
                  e.currentTarget.style.backgroundColor = theme.primaryMuted
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.borderColor = theme.border
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {size}

              {/* Diagonal strikethrough for OOS */}
              {isDisabled && (
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: theme.textMuted,
                    transform: 'rotate(-15deg)',
                    opacity: 0.6,
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
