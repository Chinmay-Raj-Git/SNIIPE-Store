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

  useEffect(() => {
    if (CART_COUNT > prevCount.current) {
      setBadgeBounce(true)
      const t = setTimeout(() => setBadgeBounce(false), 550)
      return () => clearTimeout(t)
    }
    prevCount.current = CART_COUNT
  }, [CART_COUNT])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const isActive = (path) => location.pathname === path
  const isCartActive = location.pathname === '/cart'
  const isProfileActive = location.pathname === '/profile'

  const mainNavLinks = [
    { to: '/home',        label: 'SHOP',        icon: 'fa-shirt'       },
    { to: '/collections', label: 'COLLECTIONS', icon: 'fa-layer-group' },
  ]
  const aboutLink = { to: '/about', label: 'ABOUT', icon: 'fa-circle-info' }
  const desktopNavLinks = [...mainNavLinks, aboutLink]

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

        {/* LEFT */}
        <Link to="/" className="flex items-center">
          <img
            src={theme.themeType === 'dark' ? sniipeLogo : sniipeLogoD}
            alt="SNIIPE"
            className="navbar-logo h-7 w-auto"
            style={{ filter: 'brightness(1.1)' }}
          />
        </Link>

        {/* CENTER */}
        <Link to="/" className="flex justify-center">
          <img
            src={theme.themeType === 'dark' ? birdLogo : birdLogoD}
            alt="SNIIPE"
            className="navbar-bird h-12 md:h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
          />
        </Link>

        {/* RIGHT */}
        <div className="flex justify-end items-center gap-1">

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {desktopNavLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                style={{ color: isActive(to) ? theme.primary : undefined }}
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold tracking-widest text-gray-400 hover:text-gray-500 transition-colors duration-200"
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

            {/* Cart — desktop */}
            <Link
              to="/cart"
              className="relative flex items-center px-3 py-2 transition-colors rounded-lg"
              style={{ color: isCartActive ? theme.primary : '#9ca3af ' }}
            >
              <i className="fa-solid fa-shopping-bag text-xl" />
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
          <div className="flex lg:hidden items-center gap-1">
            <Link
              to="/cart"
              className="relative p-2 rounded-lg transition-colors"
              style={{
                color: isCartActive ? theme.primary : '#9ca3af ',
                backgroundColor: isCartActive ? `${theme.primary}18` : 'transparent',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <i className="fa-solid fa-shopping-bag text-xl" />
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
              className="p-2 rounded-lg text-gray-500 hover:text-gray-600 active:opacity-70 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
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
            {/* Main links */}
            {mainNavLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                style={{
                  color: isActive(to) ? theme.primary : undefined,
                  borderLeftColor: isActive(to) ? theme.primary : 'transparent',
                  backgroundColor: isActive(to) ? `${theme.primary}10` : 'transparent',
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-wider text-gray-500 hover:text-white border-l-2 rounded-r-lg transition-all"
              >
                {icon && <i className={`fa-solid ${icon} w-5`} />}
                {label}
              </Link>
            ))}

            {/* Auth */}
            {!authLoading && (
              isAuthenticated ? (
                <Link
                  to="/profile"
                  style={{
                    color: isProfileActive ? theme.primary : undefined,
                    borderLeftColor: isProfileActive ? theme.primary : 'transparent',
                    backgroundColor: isProfileActive ? `${theme.primary}10` : 'transparent',
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-wider text-gray-500 hover:text-white border-l-2 rounded-r-lg transition-all"
                >
                  <i className="fa-solid fa-user w-5" />
                  MY PROFILE
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-4 w-fit text-sm font-semibold tracking-normal border-l-2 border-transparent rounded-r-lg transition-all"
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
                >
                  <i className="fa-solid fa-arrow-right-to-bracket w-5" />
                  SIGN IN
                </Link>
              )
            )}

            {/* About — at bottom */}
            <div style={{ borderTop: `1px solid ${theme.border}`, margin: '6px 0' }} />
            <Link
              to={aboutLink.to}
              style={{
                color: isActive(aboutLink.to) ? theme.primary : undefined,
                borderLeftColor: isActive(aboutLink.to) ? theme.primary : 'transparent',
                backgroundColor: isActive(aboutLink.to) ? `${theme.primary}10` : 'transparent',
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-wider text-gray-500 hover:text-white border-l-2 rounded-r-lg transition-all"
            >
              <i className="fa-solid fa-circle-info w-5" />
              ABOUT
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
