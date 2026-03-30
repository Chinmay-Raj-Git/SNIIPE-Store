import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

// Auth pages (standalone — no Navbar/Footer)
import Login         from './pages/Login'
import Signup        from './pages/Signup'
import OAuthCallback from './pages/OAuthCallback'

// Protected pages
import Cart         from './pages/Cart'
import Checkout     from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Profile      from './pages/Profile'
import Orders       from './pages/Orders'

// Static / informational pages
import About         from './pages/About'
import Privacy       from './pages/Privacy'
import Terms         from './pages/Terms'
import Refund        from './pages/Refund'
import Cancellations from './pages/Cancellations'

export default function App() {
  return (
    <ThemeProvider>
      <ServerStatusProvider>
      <LoadingProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>

                {/* ── Standalone auth pages (no Navbar/Footer) ── */}
                <Route path="/login"  element={<Login />}  />
                <Route path="/signup" element={<Signup />} />

                {/* OAuth callback — Supabase redirects here after Google login */}
                <Route path="/auth/callback" element={<OAuthCallback />} />

                {/* ── Main site (Navbar + AnnouncementBar + Footer) ── */}
                <Route element={<MainLayout />}>

                  {/* Public */}
                  <Route path="/"            element={<Landing />}     />
                  <Route path="/home"        element={<Home />}        />
                  <Route path="/product/:id" element={<ProductPage />} />

                  {/* Static / informational */}
                  <Route path="/about"         element={<About />}         />
                  <Route path="/privacy"       element={<Privacy />}       />
                  <Route path="/terms"         element={<Terms />}         />
                  <Route path="/refund"        element={<Refund />}        />
                  <Route path="/cancellations" element={<Cancellations />} />

                  {/* Protected */}
                  <Route path="/cart"     element={<AuthGuard><Cart /></AuthGuard>}     />
                  <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
                  <Route path="/order-success/:id" element={<AuthGuard><OrderSuccess /></AuthGuard>} />
                  <Route path="/profile"  element={<AuthGuard><Profile /></AuthGuard>}  />
                  <Route path="/orders"   element={<AuthGuard><Orders /></AuthGuard>}   />

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

