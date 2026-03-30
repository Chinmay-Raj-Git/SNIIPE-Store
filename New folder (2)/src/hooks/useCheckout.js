import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from './useCart'
import { useAuth } from './useAuth'
import {
  apiCheckoutCart,
  apiCreateRazorpayOrder,
  apiVerifyPayment,
  apiApplyCoupon,
} from '../api/checkoutApi'
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/paymentUtils'

export function useCheckout() {
  const { clearCart } = useCart()
  const { user }      = useAuth()
  const navigate      = useNavigate()

  const [processing, setProcessing]   = useState(false)
  const [error, setError]             = useState('')
  const [couponResult, setCouponResult] = useState(null) // from apiApplyCoupon
  const [couponLoading, setCouponLoading] = useState(false)

  // ── Apply coupon preview ────────────────────────────────────
  const applyCoupon = useCallback(async (code) => {
    if (!code.trim()) return
    setCouponLoading(true)
    setError('')
    setCouponResult(null)
    try {
      const result = await apiApplyCoupon(code)
      setCouponResult(result)
      return result
    } catch (e) {
      const msg = e?.response?.data?.error ?? 'Invalid coupon'
      setError(msg)
      throw new Error(msg)
    } finally {
      setCouponLoading(false)
    }
  }, [])

  const removeCoupon = useCallback(() => setCouponResult(null), [])

  // ── Full checkout flow ──────────────────────────────────────
  const initiateCheckout = useCallback(async ({ addressId, couponCode, theme } = {}) => {
    setProcessing(true)
    setError('')

    try {
      // Step 1: load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) throw new Error('Payment service unavailable. Please try again.')

      // Step 2: create backend order (pending_payment)
      const { order_id } = await apiCheckoutCart({
        address_id: addressId,
        coupon_code: couponCode || undefined,
      })

      // Step 3: create Razorpay order
      const rzpData = await apiCreateRazorpayOrder(order_id)

      // ₹0 order (full coupon discount)
      if (!rzpData.payment_required) {
        await clearCart()
        navigate(`/order-success/${order_id}`)
        return
      }

      // Step 4: open Razorpay modal
      setProcessing(false) // allow UI interaction during modal

      await new Promise((resolve, reject) => {
        openRazorpayCheckout({
          key: rzpData.key,
          amount: rzpData.amount,
          currency: rzpData.currency,
          razorpay_order_id: rzpData.razorpay_order_id,
          name: rzpData.name ?? 'SNIIPE',
          description: rzpData.description ?? 'Order Payment',
          prefill: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            contact: user?.phone ?? '',
          },
          theme: { primary: theme?.primary ?? '#a855f7' },
          onSuccess: async (paymentData) => {
            try {
              setProcessing(true)
              // Step 5: verify payment
              await apiVerifyPayment({
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
              })
              await clearCart()
              navigate(`/order-success/${order_id}`)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          onDismiss: () => {
            reject(new Error('DISMISSED'))
          },
        })
      })
    } catch (e) {
      if (e?.message === 'DISMISSED') {
        setError('') // user dismissed — not an error
      } else {
        const msg = e?.response?.data?.error ?? e?.message ?? 'Checkout failed. Please try again.'
        setError(msg)
      }
    } finally {
      setProcessing(false)
    }
  }, [clearCart, navigate, user])

  return {
    processing,
    error,
    setError,
    couponResult,
    couponLoading,
    applyCoupon,
    removeCoupon,
    initiateCheckout,
  }
}
