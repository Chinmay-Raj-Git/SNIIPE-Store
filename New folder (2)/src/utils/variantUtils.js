/**
 * variantUtils.js
 *
 * Utilities for working with product variants.
 *
 * A variant has shape: { color: string|null, size: string|null, stock: number }
 *
 * Variant Resolution Logic
 * ─────────────────────────
 * A product can have:
 *   - color + size variants  (e.g. Black/S, Black/M, White/S …)
 *   - size-only variants     (no color distinction)
 *   - color-only variants
 *   - a single variant (no options)
 *
 * resolveVariant() finds the best-matching variant for the
 * currently selected color and size.
 */

/**
 * Find the variant that matches the selected color and size.
 * Falls back gracefully if only one dimension is selectable.
 *
 * @param {Array}       variants      - product.variants array
 * @param {string|null} selectedColor - currently selected color (or null)
 * @param {string|null} selectedSize  - currently selected size (or null)
 * @returns {Object|null} matched variant or null
 */
export function resolveVariant(variants, selectedColor, selectedSize) {
  if (!variants || variants.length === 0) return null

  // Exact match on both dimensions
  if (selectedColor && selectedSize) {
    const exact = variants.find(
      (v) =>
        normalizeStr(v.color) === normalizeStr(selectedColor) &&
        normalizeStr(v.size) === normalizeStr(selectedSize)
    )
    if (exact) return exact
  }

  // Color only
  if (selectedColor && !selectedSize) {
    const match = variants.find(
      (v) => normalizeStr(v.color) === normalizeStr(selectedColor)
    )
    if (match) return match
  }

  // Size only
  if (!selectedColor && selectedSize) {
    const match = variants.find(
      (v) => normalizeStr(v.size) === normalizeStr(selectedSize)
    )
    if (match) return match
  }

  // No selection — return first variant
  return variants[0]
}

/**
 * Get all unique colors available for a product.
 * @param {Array} variants
 * @returns {string[]} deduplicated, filtered color names
 */
export function getUniqueColors(variants) {
  if (!variants) return []
  const seen = new Set()
  return variants
    .map((v) => v.color)
    .filter(Boolean)
    .filter((c) => {
      const key = normalizeStr(c)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

/**
 * Get all unique sizes available for a product.
 * Ordered by standard clothing size order when possible.
 * @param {Array} variants
 * @returns {string[]} ordered, deduplicated size names
 */
export function getUniqueSizes(variants) {
  if (!variants) return []
  const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']
  const seen = new Set()
  const sizes = variants
    .map((v) => v.size)
    .filter(Boolean)
    .filter((s) => {
      const key = normalizeStr(s)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  return sizes.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase())
    const bi = SIZE_ORDER.indexOf(b.toUpperCase())
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

/**
 * Get sizes available for a specific color (with stock > 0 flagged).
 * @param {Array}  variants
 * @param {string} color
 * @returns {Array<{size: string, inStock: boolean}>}
 */
export function getSizesForColor(variants, color) {
  if (!variants) return []
  const colorVariants = color
    ? variants.filter((v) => normalizeStr(v.color) === normalizeStr(color))
    : variants

  const seen = new Set()
  return colorVariants
    .filter((v) => v.size)
    .filter((v) => {
      const key = normalizeStr(v.size)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((v) => ({ size: v.size, inStock: v.stock > 0, stock: v.stock }))
}

/**
 * Get total stock across all variants, or for a specific color.
 * @param {Array}       variants
 * @param {string|null} color - filter by color if provided
 * @returns {number}
 */
export function getTotalStock(variants, color = null) {
  if (!variants) return 0
  const filtered = color
    ? variants.filter((v) => normalizeStr(v.color) === normalizeStr(color))
    : variants
  return filtered.reduce((sum, v) => sum + (v.stock ?? 0), 0)
}

/**
 * Determine stock level label for a resolved variant (or product).
 * @param {number} stock
 * @returns {'OUT_OF_STOCK'|'LOW_STOCK'|'IN_STOCK'}
 */
export function getStockLevel(stock) {
  if (stock === 0) return 'OUT_OF_STOCK'
  if (stock < 5) return 'LOW_STOCK'
  return 'IN_STOCK'
}

/**
 * Get images filtered by selected color.
 * Falls back to all images if no color-specific images exist.
 * @param {Array}       images        - product.images
 * @param {string|null} selectedColor
 * @returns {Array<{url, color}>}
 */
export function getImagesForColor(images, selectedColor) {
  if (!images || images.length === 0) return []
  if (!selectedColor) return images

  const colorImages = images.filter(
    (img) => normalizeStr(img.color) === normalizeStr(selectedColor)
  )
  return colorImages.length > 0 ? colorImages : images
}

// ── Internal helpers ──────────────────────────────────────
function normalizeStr(str) {
  return (str ?? '').toString().trim().toLowerCase()
}
