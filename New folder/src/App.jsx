import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LoadingProvider } from './context/LoadingContext'
import { ServerStatusProvider } from './context/ServerStatusContext'
import AuthGuard from './components/AuthGuard'
import MainLayout from './layouts/MainLayout'

// Pages — public
import Landing     from './pages/Landing'
import Home        from './pages/Home'
import ProductPage from './pages/ProductPage'
import NotFound    from './pages/NotFound'

// Auth pages (standalone)
import Login  from './pages/Login'
import Signup from './pages/Signup'

// Protected pages
import Cart         from './pages/Cart'
import Checkout     from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Profile      from './pages/Profile'

export default function App() {
  return (
    <ThemeProvider>
      <ServerStatusProvider>
      <LoadingProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>

                {/* ── Standalone auth pages ── */}
                <Route path="/login"  element={<Login />}  />
                <Route path="/signup" element={<Signup />} />

                {/* ── Main site (Navbar + Footer) ── */}
                <Route element={<MainLayout />}>
                  <Route path="/"            element={<Landing />}     />
                  <Route path="/home"        element={<Home />}        />
                  <Route path="/product/:id" element={<ProductPage />} />

                  {/* Protected */}
                  <Route path="/cart"     element={<AuthGuard><Cart /></AuthGuard>}     />
                  <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
                  <Route path="/order-success/:id" element={<AuthGuard><OrderSuccess /></AuthGuard>} />
                  <Route path="/profile"  element={<AuthGuard><Profile /></AuthGuard>}  />
                  <Route path="/orders"   element={<AuthGuard><OrdersPage /></AuthGuard>} />

                  {/* Placeholder routes */}
                  <Route path="/about"   element={<PlaceholderPage title="About SNIIPE" />} />
                  <Route path="/support" element={<PlaceholderPage title="Support"       />} />
                  <Route path="/contact" element={<PlaceholderPage title="Contact Us"    />} />

                  {/* 404 — catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Route>

              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LoadingProvider>
      </ServerStatusProvider>
    </ThemeProvider>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>{title}</h1>
      <p style={{ color: '#9ca3af' }}>Coming soon</p>
    </div>
  )
}

function OrdersPage() {
  return <PlaceholderPage title="My Orders" />
}
