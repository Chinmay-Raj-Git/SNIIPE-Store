import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  apiFetchCart,
  apiAddToCart,
  apiUpdateCartItem,
  apiRemoveCartItem,
  apiClearCart,
} from '../api/cartApi'
import { useAuthContext } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuthContext()

  const [cartItems, setCartItems]       = useState([])
  const [cartTotal, setCartTotal]       = useState(0)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  // ── cartCount derived ────────────────────────────────────
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  // ── Fetch cart ────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([])
      setCartTotal(0)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetchCart()
      setCartItems(data.cart ?? [])
      setCartTotal(data.total ?? 0)
    } catch (e) {
      console.error('[CartContext] fetchCart error', e)
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Re-fetch cart whenever auth state changes
  useEffect(() => { fetchCart() }, [fetchCart])

  // ── Add to cart ────────────────────────────────────────────
  const addToCart = useCallback(async (productId, variantId, quantity = 1) => {
    await apiAddToCart(productId, variantId, quantity)
    await fetchCart()
  }, [fetchCart])

  // ── Update quantity ────────────────────────────────────────
  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return
    // Optimistic update
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i))
    try {
      await apiUpdateCartItem(itemId, quantity)
      await fetchCart()
    } catch {
      await fetchCart() // rollback on error
    }
  }, [fetchCart])

  // ── Remove item ────────────────────────────────────────────
  const removeItem = useCallback(async (itemId) => {
    // Optimistic update
    setCartItems(prev => prev.filter(i => i.id !== itemId))
    try {
      await apiRemoveCartItem(itemId)
      await fetchCart()
    } catch {
      await fetchCart()
    }
  }, [fetchCart])

  // ── Clear cart ─────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setCartItems([])
    setCartTotal(0)
    try {
      await apiClearCart()
    } catch (e) {
      console.error('[CartContext] clearCart error', e)
    }
  }, [])

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal,
      loading, error,
      fetchCart, addToCart, updateQuantity, removeItem, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be inside <CartProvider>')
  return ctx
}

export default CartContext
