import axiosClient from './axiosClient'

/**
 * checkoutApi.js
 *
 * Checkout + payment endpoints:
 *
 *   POST /checkout/razorpay/cart
 *     body: { address_id, coupon_code? }
 *     → { order_id, amount }   (creates DB order at pending_payment)
 *
 *   POST /payments/razorpay/create-order
 *     body: { order_id }
 *     → { payment_required, key, amount, currency, razorpay_order_id, name, description }
 *       OR { payment_required: false, order_id } (for ₹0 coupon orders)
 *
 *   POST /payments/razorpay/verify
 *     body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *     → { message }
 *
 *   POST /coupons/apply
 *     body: { code, context: 'cart' }
 *     → { coupon_code, discount_type, discount_value, original_total, discount_amount, final_total }
 */

export async function apiCheckoutCart({ address_id, coupon_code } = {}) {
  const body = { address_id }
  if (coupon_code) body.coupon_code = coupon_code
  const { data } = await axiosClient.post('/checkout/razorpay/cart', body)
  return data  // { order_id, amount }
}

export async function apiCreateRazorpayOrder(orderId) {
  const { data } = await axiosClient.post('/payments/razorpay/create-order', { order_id: orderId })
  return data
}

export async function apiVerifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const { data } = await axiosClient.post('/payments/razorpay/verify', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  })
  return data
}

export async function apiApplyCoupon(code) {
  const { data } = await axiosClient.post('/coupons/apply', {
    code: code.trim().toUpperCase(),
    context: 'cart',
  })
  return data
}
