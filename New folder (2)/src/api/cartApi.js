import axiosClient from './axiosClient'

/**
 * cartApi.js
 *
 * Backend cart endpoints (all require Bearer auth):
 *   GET  /cart                      → { cart: [...], total }
 *   GET  /cart/count                → { count }
 *   POST /cart/add                  → { message }  body: { product_id, variant_id, quantity }
 *   PUT  /cart/update/<item_id>     → { message }  body: { quantity }
 *   DELETE /cart/remove/<item_id>   → { message }
 *   DELETE /cart/clear              → { message }
 *
 * Cart item shape from GET /cart:
 *   { id, product_name, variant_color, variant_size, quantity, price, subtotal, is_free_item }
 *
 * We also need the thumbnail — the backend doesn't return it on GET /cart.
 * We store it locally inside CartContext when the item is added.
 */

export async function apiFetchCart() {
  const { data } = await axiosClient.get('/cart')
  return data  // { cart: [...], total }
}

export async function apiGetCartCount() {
  const { data } = await axiosClient.get('/cart/count')
  return data.count ?? 0
}

export async function apiAddToCart(productId, variantId, quantity = 1) {
  const { data } = await axiosClient.post('/cart/add', {
    product_id: productId,
    variant_id: variantId,
    quantity,
  })
  return data
}

export async function apiUpdateCartItem(itemId, quantity) {
  const { data } = await axiosClient.put(`/cart/update/${itemId}`, { quantity })
  return data
}

export async function apiRemoveCartItem(itemId) {
  const { data } = await axiosClient.delete(`/cart/remove/${itemId}`)
  return data
}

export async function apiClearCart() {
  const { data } = await axiosClient.delete('/cart/clear')
  return data
}
