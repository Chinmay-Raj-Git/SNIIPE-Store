import { useState, useEffect } from 'react'
import { fetchProductById, normalizeProduct } from '../api/productApi'
import {
  getUniqueColors,
  getUniqueSizes,
  getImagesForColor,
  resolveVariant,
} from '../utils/variantUtils'

/**
 * useProductDetail
 *
 * Fetches a single product and manages all variant/gallery state
 * for the Product Detail Page.
 *
 * @param {string|number} productId
 *
 * Returns:
 *   product         — normalized product object
 *   loading         — fetch in progress
 *   error           — error string or null
 *
 *   selectedColor   — currently selected color
 *   setSelectedColor
 *   selectedSize    — currently selected size
 *   setSelectedSize
 *   resolvedVariant — the variant matching current color+size
 *
 *   colors          — unique color list
 *   sizes           — unique size list
 *   activeImages    — images filtered for selected color
 *
 *   activeImageIndex  — index of large image
 *   setActiveImageIndex
 */
export function useProductDetail(productId) {
  const [product, setProduct]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize]   = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (!productId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setProduct(null)
      setSelectedColor(null)
      setSelectedSize(null)
      setActiveImageIndex(0)

      try {
        const raw = await fetchProductById(productId)
        if (cancelled) return

        const normalized = normalizeProduct(raw)
        setProduct(normalized)

        // Pre-select the first available color
        const colors = getUniqueColors(normalized.variants)
        if (colors.length > 0) setSelectedColor(colors[0])

        // Pre-select the first available size
        const sizes = getUniqueSizes(normalized.variants)
        if (sizes.length > 0) setSelectedSize(sizes[0])
      } catch (err) {
        if (!cancelled) {
          console.error('[useProductDetail] fetch failed:', err)
          setError('Product not found or failed to load.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [productId])

  // Reset image index when color changes
  useEffect(() => {
    setActiveImageIndex(0)
  }, [selectedColor])

  // ── Derived values ──────────────────────────────────────
  const colors         = product ? getUniqueColors(product.variants) : []
  const sizes          = product ? getUniqueSizes(product.variants) : []
  const activeImages   = product ? getImagesForColor(product.images, selectedColor) : []
  const resolvedVariant = product
    ? resolveVariant(product.variants, selectedColor, selectedSize)
    : null

  return {
    product,
    loading,
    error,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    resolvedVariant,
    colors,
    sizes,
    activeImages,
    activeImageIndex,
    setActiveImageIndex,
  }
}
