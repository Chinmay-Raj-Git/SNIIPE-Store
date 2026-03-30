import axiosClient from './axiosClient'

/**
 * productApi.js
 *
 * API shape notes (from Flask routes.py):
 *
 * GET /products  → returns JSON array:
 *   [{ id, name, description, price, category, thumbnail, is_out_of_stock }]
 *   NOTE: NO variants/images in this response — stock comes from is_out_of_stock flag
 *
 * GET /product/<id>  → returns render_template HTML (NOT JSON!)
 *   We must use the separate JSON variant/image endpoints instead:
 *
 * GET /products/<id>/variants → JSON array:
 *   [{ id, product_id, color, size, stock, price_override }]
 *
 * GET /products/<id>/images   → JSON array (optional ?color=X):
 *   [{ id, color, image_url, role, sort_order }]
 */


/**
 * Fetch all products for the listing page.
 * GET /products
 */
export async function fetchProducts() {
  const { data } = await axiosClient.get('/products')
  return data
}


/**
 * Fetch all products AND their variants in one batch for the listing page.
 *
 * Strategy:
 *   1. GET /products → base list (no variants)
 *   2. Fire GET /products/<id>/variants for every product in parallel
 *   3. Merge variant arrays back onto each product
 *
 * The backend's /products endpoint intentionally omits variants (routes.py confirmed).
 * Each per-product variant fetch is allowed to fail silently — the product still
 * renders, just without color pills (graceful degradation).
 *
 * @returns {Promise<Array>} raw product objects each with a `variants` array attached
 */
export async function fetchProductsWithVariants() {
  const { data: products } = await axiosClient.get('/products')

  // Fan-out: one variants request per product, individual failures return []
  const variantResults = await Promise.allSettled(
    products.map((p) =>
      axiosClient.get(`/products/${p.id}/variants`).then((r) => r.data)
    )
  )

  return products.map((p, i) => ({
    ...p,
    variants: variantResults[i].status === 'fulfilled' ? variantResults[i].value : [],
  }))
}


/**
 * Fetch a complete product by ID by calling the three JSON endpoints
 * and assembling the data — since GET /product/<id> returns HTML not JSON.
 *
 * Calls in parallel:
 *   GET /products              (to get base product fields)
 *   GET /products/<id>/variants
 *   GET /products/<id>/images
 *
 * @param {string|number} id
 * @returns {Promise<Object>} assembled product object
 */
export async function fetchProductById(id) {
  const [productsRes, variantsRes, imagesRes] = await Promise.all([
    axiosClient.get('/products'),
    axiosClient.get(`/products/${id}/variants`),
    axiosClient.get(`/products/${id}/images`),
  ])

  const productList = productsRes.data
  const baseProduct = productList.find((p) => String(p.id) === String(id))

  if (!baseProduct) {
    throw new Error(`Product ${id} not found`)
  }

  return {
    id:              baseProduct.id,
    name:            baseProduct.name,
    description:     baseProduct.description,
    price:           baseProduct.price,
    category:        baseProduct.category,
    thumbnail:       baseProduct.thumbnail,
    is_out_of_stock: baseProduct.is_out_of_stock,
    variants:        variantsRes.data,
    images:          imagesRes.data,
  }
}


/**
 * Normalize a raw product from fetchProducts() (listing page).
 *
 * When called after fetchProductsWithVariants(), `raw.variants` will be
 * the fully-loaded variant array from GET /products/<id>/variants.
 * When called after plain fetchProducts(), `raw.variants` is undefined
 * and we fall back to an empty array (color pills simply won't render).
 */
export function normalizeListProduct(raw) {
  return {
    id:          raw.id,
    name:        raw.name        ?? 'Unnamed Product',
    description: raw.description ?? '',
    price:       raw.price       ?? 0,
    category:    raw.category    ?? 'Clothing',
    thumbnail:   raw.thumbnail   ?? null,
    isOutOfStock: raw.is_out_of_stock ?? false,
    images:   [],
    // Preserve variants if already fetched by fetchProductsWithVariants(),
    // otherwise empty array — stock/OOS relies on is_out_of_stock flag.
    variants: (raw.variants ?? []).map((v) => ({
      id:    v.id,
      color: v.color ?? null,
      size:  v.size  ?? null,
      stock: typeof v.stock === 'number' ? v.stock : 0,
      priceOverride: v.price_override ?? null,
    })),
  }
}


/**
 * Normalize a full product from fetchProductById() (detail page).
 * These have variants and images from the separate endpoints.
 */
export function normalizeProduct(raw) {
  return {
    id:          raw.id,
    name:        raw.name        ?? 'Unnamed Product',
    description: raw.description ?? '',
    price:       raw.price       ?? 0,
    category:    raw.category    ?? 'Clothing',
    thumbnail:   raw.thumbnail   ?? null,
    isOutOfStock: raw.is_out_of_stock ?? false,

    // images shape: [{ id, color, image_url, role, sort_order }]
    images: (raw.images ?? []).map((img) => ({
      url:   img.image_url ?? img.url ?? '',
      color: img.color     ?? null,
      role:  img.role      ?? null,
      aspect_ratio: img.aspect_ratio ?? null,
    })),

    // variants shape: [{ id, product_id, color, size, stock, price_override }]
    variants: (raw.variants ?? []).map((v) => ({
      id:            v.id,
      color:         v.color          ?? null,
      size:          v.size           ?? null,
      stock:         typeof v.stock === 'number' ? v.stock : 0,
      priceOverride: v.price_override ?? null,
    })),
  }
}


/**
 * Normalize an array of list products (used by useProducts hook).
 */
export function normalizeProducts(rawArray) {
  return (rawArray ?? []).map(normalizeListProduct)
}
