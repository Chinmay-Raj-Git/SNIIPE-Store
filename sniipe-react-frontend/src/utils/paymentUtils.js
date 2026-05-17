/**
 * paymentUtils.js — Razorpay checkout popup helper.
 *
 * Flow:
 *   1. Backend creates an Order (pending_payment) → returns order_id
 *   2. Backend creates Razorpay order → returns key, razorpay_order_id, amount
 *   3. This util opens the Razorpay popup
 *   4. On success → call verifyPayment (backend /payments/razorpay/verify)
 */

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/**
 * Opens the Razorpay checkout modal.
 *
 * @param {Object} options
 *   .key             — Razorpay API key
 *   .amount          — amount in paise
 *   .currency        — 'INR'
 *   .razorpay_order_id
 *   .name            — merchant name
 *   .description
 *   .prefill         — { name, email, contact }
 *   .theme           — { color }
 *   .onSuccess(paymentData)  — called on successful payment
 *   .onDismiss()     — called when user closes modal
 */
export function openRazorpayCheckout({
  key, amount, currency = 'INR', razorpay_order_id,
  name, description, prefill = {}, theme = {},
  onSuccess, onDismiss,
}) {
  const rzp = new window.Razorpay({
    key,
    amount,
    currency,
    order_id: razorpay_order_id,
    name: name ?? 'SNIIPE',
    description: description ?? 'Order Payment',
    prefill,
    theme: { color: theme.primary ?? '#a855f7', ...theme },
    modal: {
      ondismiss: () => onDismiss?.(),
    },
    handler: (response) => {
      onSuccess?.(response)
    },
  })
  rzp.open()
  return rzp
}
