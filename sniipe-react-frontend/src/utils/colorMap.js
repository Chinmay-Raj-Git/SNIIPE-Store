/**
 * colorMap.js — Single source of truth for color name → hex mapping.
 * Used by ProductCard (color dot pills) and ColorSelector (color swatches).
 */
export const COLOR_HEX = {
  black: '#1c1c1c',
  white: '#f5f5f5',
  red: '#d63031',
  blue: '#0984e3',
  navy: '#1a365d',
  green: '#ADDE7A',
  forest_green: '#224C32',
  lavender: '#d6befa',
  yellow: '#fdcb6e',
  orange: '#e17055',
  purple: '#a29bfe',
  pink: '#fd79a8',
  grey: '#636e72',
  gray: '#636e72',
  brown: '#c19a6b',
  dark_brown: '#8B4513',
  beige: '#d6cbb5',
  cream: '#fffdd0',
  maroon: '#800000',
  teal: '#008080',
  olive: '#808000',
  khaki: '#c3b091',
  charcoal: '#36454f',
  coral: '#ff7f7f',
  mint: '#98ff98',
  cool_lavender: '#e6e6fa',
  tan: '#d2b48c',
  camel: '#c19a6b',
  ivory: '#fffff0',
  sand: '#c2b280',
}

/**
 * Returns the hex value for a color name, normalising spaces → underscores.
 * Falls back to a neutral gray for unknown names.
 */
export function colorNameToHex(name) {
  if (!name) return '#888888'
  const key = name.trim().toLowerCase().replace(/\s+/g, '_')
  return COLOR_HEX[key] ?? '#888888'
}

/** Determines if a hex color is visually light (for icon contrast). */
export function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
