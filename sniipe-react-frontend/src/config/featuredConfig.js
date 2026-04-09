/**
 * featuredConfig.js
 *
 * Central configuration for the Featured Products section on the Landing page.
 *
 * USAGE:
 *   - `categories`: ordered list of category slugs to display.
 *     Products from each category are shown in order — no interleaving.
 *   - `totalProducts`: total number of products to show across all categories.
 *   - `perCategory`: how many products to show per category.
 *     If omitted, totalProducts is divided equally across categories.
 *
 * EXAMPLE — single category, 6 products:
 *   { categories: ['Kurtis'], totalProducts: 6 }
 *
 * EXAMPLE — two categories, 3 each:
 *   { categories: ['Kurtis', 'Oversized'], totalProducts: 6, perCategory: 3 }
 *
 * CATEGORY LABEL MAP:
 *   Maps the raw `category` string from the API to a human-readable heading.
 *   Extend this map whenever new categories are added to the backend.
 */

export const FEATURED_CONFIG = {
  /** Ordered list of category keys (must match product.category from API). */
  categories: ['Kurtis', 'Oversized'],

  /** Total number of products to display across all active categories. */
  totalProducts: 4,

  /**
   * Optional: max products per category.
   * When set, each category shows at most this many products.
   * When omitted, the budget is split evenly across categories.
   */
  perCategory: 2,
}

/**
 * Human-readable labels for each category key.
 * Used as section headings in the Featured Products UI.
 */
export const CATEGORY_LABELS = {
  Kurtis:    'Kurtis',
  Oversized: 'Oversized T-Shirts',
  Hoodies:   'Hoodies',
  // Add more as the catalogue grows:
  // Bottoms:   'Bottoms',
  // Jackets:   'Jackets',
}

/**
 * Derives per-category product limits from the config.
 *
 * @param {string[]} categories  - active category list
 * @param {number}   total       - total product budget
 * @param {number}  [perCat]     - optional explicit per-category cap
 * @returns {Object}             - { [categoryKey]: maxCount }
 */
export function buildCategoryLimits(categories, total, perCat) {
  const limits = {}
  const effectivePerCat = perCat ?? Math.floor(total / (categories.length || 1))
  categories.forEach((cat) => {
    limits[cat] = effectivePerCat
  })
  return limits
}

/**
 * Groups and orders a flat product array according to FEATURED_CONFIG.
 *
 * - Products are grouped by category.
 * - Each group is capped at the configured per-category limit.
 * - Groups are returned in the order defined in `categories`.
 * - Products whose category is not in the config are silently excluded.
 *
 * @param {Object[]} allProducts   - normalized products from the API
 * @param {Object}   config        - FEATURED_CONFIG (or a custom override)
 * @returns {{ category: string, label: string, products: Object[] }[]}
 */
export function groupFeaturedProducts(allProducts, config = FEATURED_CONFIG) {
  const { categories, totalProducts, perCategory } = config
  const limits = buildCategoryLimits(categories, totalProducts, perCategory)

  // Bucket products by category key
  const buckets = {}
  categories.forEach((cat) => { buckets[cat] = [] })

  for (const product of allProducts) {
    const cat = product.category
    if (buckets[cat] && buckets[cat].length < limits[cat]) {
      buckets[cat].push(product)
    }
  }

  // Return ordered array of { category, label, products } — skip empty groups
  return categories
    .map((cat) => ({
      category: cat,
      label:    CATEGORY_LABELS[cat] ?? cat,
      products: buckets[cat],
    }))
    .filter((group) => group.products.length > 0)
}
