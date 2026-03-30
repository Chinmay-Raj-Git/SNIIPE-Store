/**
 * priceUtils.js — formatting and price calculations for cart/checkout.
 */

export function formatINR(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function calcSubtotal(cartItems = []) {
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

export function calcShipping(subtotal) {
  // Free shipping above ₹999
  return subtotal >= 999 ? 0 : 99
}

export function calcTotal(subtotal, shipping = 0, discount = 0) {
  return Math.max(0, subtotal + shipping - discount)
}
