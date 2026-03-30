import { useState, useEffect, useCallback } from 'react'
import { fetchProductsWithVariants, normalizeProducts } from '../api/productApi'

/**
 * useProducts
 *
 * Fetches the full product list from the API and exposes
 * filtering/search state locally (no backend call needed for filtering).
 *
 * Returns:
 *   products      — full normalized list
 *   filtered      — list after applying current filters
 *   loading       — fetch in progress
 *   error         — error message or null
 *   search        — current search string
 *   setSearch     — update search
 *   category      — active category filter
 *   setCategory   — update category
 *   sortBy        — current sort key
 *   setSortBy     — update sort
 *   categories    — unique category list from data
 *   refetch       — manually re-trigger fetch
 */
export function useProducts() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // Filter state
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [sortBy, setSortBy]       = useState('default') // 'default' | 'price-asc' | 'price-desc' | 'name'

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await fetchProductsWithVariants()
      setProducts(normalizeProducts(raw))
    } catch (err) {
      console.error('[useProducts] fetch failed:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // ── Derived: unique categories ─────────────────────────
  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]

  // ── Derived: filtered + sorted list ───────────────────
  const filtered = products
    .filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || p.category === category
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':  return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'name':       return a.name.localeCompare(b.name)
        default:           return 0
      }
    })

  return {
    products,
    filtered,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    sortBy,
    setSortBy,
    categories,
    refetch: loadProducts,
  }
}
