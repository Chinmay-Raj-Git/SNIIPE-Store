import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import ProfileMenu from './auth/ProfileMenu'
import sniipeLogo from '../assets/sniipe.png'
import sniipeLogoD from '../assets/sniipe_black.png'
import birdLogo from '../assets/bird.png'
import birdLogoD from '../assets/bird_black.png'

export default function Navbar() {
  const { theme } = useTheme()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { cartCount: CART_COUNT } = useCart()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [badgeBounce, setBadgeBounce] = useState(false)
  const prevCount = useRef(CART_COUNT)

  // Trigger bounce when cart count increases
  useEffect(() => {
    if (CART_COUNT > prevCount.current) {
      setBadgeBounce(true)
      const t = setTimeout(() => setBadgeBounce(false), 550)
      return () => clearTimeout(t)
    }
    prevCount.current = CART_COUNT
  }, [CART_COUNT])

  useEffect(() => { setMenuOpen(false) }, [location])

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: '/home', label: 'SHOP', icon: 'fa-bag-shopping' },
    { to: '/about', label: 'ABOUT', icon: null },
  ]

  return (
    <header
      style={{
        backgroundColor: theme.navBg,
        borderColor: theme.navBorder,
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
      className="sticky top-0 z-50 w-full border-b transition-shadow duration-300"
    >
      <nav className="max-w-[90rem] mx-auto px-6 py-3 grid grid-cols-3 items-center">

        {/* LEFT — SNIIPE wordmark */}
        <Link to="/" className="flex items-center">
          <img
            src={theme.themeType === 'dark' ? sniipeLogo : sniipeLogoD}
            alt="SNIIPE"
            className="h-7 w-auto"
            style={{ filter: 'brightness(1.1)' }}
          />
        </Link>

        {/* CENTER — Bird icon */}
        <Link to="/" className="flex justify-center">
          <img
            src={theme.themeType === 'dark' ? birdLogo : birdLogoD}
            alt="SNIIPE"
            className="h-12 md:h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
          />
        </Link>

        {/* RIGHT — Desktop nav */}
        <div className="flex justify-end items-center gap-1">

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                style={{ color: isActive(to) ? theme.primary : undefined }}
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold tracking-widest text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {icon && <i className={`fa-solid ${icon}`} />}
                {label}
                {isActive(to) && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                )}
              </Link>
            ))}

            {/* Auth section — only render once loading is done to avoid flash */}
            {!authLoading && (
              isAuthenticated ? (
                <div style={{ marginLeft: '6px' }}>
                  <ProfileMenu />
                </div>
              ) : (
                <Link
                  to="/login"
                  style={{
                    marginLeft: '8px',
                    padding: '7px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    border: `1.5px solid ${theme.primary}`,
                    color: theme.primary,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = theme.primary
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = theme.primary
                  }}
                >
                  Sign In
                </Link>
              )
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-shopping-cart text-xl" />
              {CART_COUNT > 0 && (
                <span
                  className={`absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none${badgeBounce ? ' cart-badge-bounce' : ''}`}
                  style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                >
                  {CART_COUNT}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link to="/cart" className="relative p-2 text-gray-300 hover:text-white">
              <i className="fa-solid fa-bag-shopping text-xl" />
              {CART_COUNT > 0 && (
                <span
                  className={`absolute top-0.5 right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold${badgeBounce ? ' cart-badge-bounce' : ''}`}
                  style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                >
                  {CART_COUNT}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Toggle menu"
            >
              <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.navBorder }}
          className="lg:hidden border-t"
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                style={{
                  color: isActive(to) ? theme.primary : undefined,
                  borderLeftColor: isActive(to) ? theme.primary : 'transparent',
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-wider text-gray-300 hover:text-white border-l-2 transition-all"
              >
                {icon && <i className={`fa-solid ${icon} w-5`} />}
                {label}
              </Link>
            ))}

            {/* Mobile auth */}
            {!authLoading && (
              isAuthenticated ? (
                <Link
                  to="/profile"
                  style={{ borderLeftColor: 'transparent' }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-wider text-gray-300 hover:text-white border-l-2 border-transparent transition-all"
                >
                  <i className="fa-solid fa-user w-5" />
                  MY PROFILE
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-wider border-l-2 border-transparent transition-all"
                  style={{ color: theme.primary }}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket w-5" />
                  SIGN IN
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  )
}
