import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import birdLogo from '../assets/bird.png'

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer
      style={{
        backgroundColor: theme.footerBg,
        borderColor: theme.footerBorder,
        color: theme.footerText,
      }}
      className="border-t mt-auto"
    >
      {/* Main footer grid */}
      <div className="footer-inner max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src={birdLogo} alt="SNIIPE" className="h-10 w-auto opacity-80" />
            <span
              style={{ color: theme.textPrimary }}
              className="font-heading text-2xl font-bold tracking-widest"
            >
              SNIIPE
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Premium streetwear focused on quality fabric, clean silhouettes, and limited drops.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"
              style={{ color: theme.textSecondary }}
              className="hover:text-white transition-colors text-lg"
            >
              <i className="fa-brands fa-instagram" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"
              style={{ color: theme.textSecondary }}
              className="hover:text-white transition-colors text-lg"
            >
              <i className="fa-brands fa-x-twitter" />
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 style={{ color: theme.textPrimary }} className="text-sm font-semibold tracking-widest uppercase mb-4">
            Shop
          </h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'All Products', to: '/home' },
              { label: 'Collections',  to: '/collections' },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help links */}
        <div>
          <h4 style={{ color: theme.textPrimary }} className="text-sm font-semibold tracking-widest uppercase mb-4">
            Help
          </h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Support',    to: '/support' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'My Orders',  to: '/orders'  },
              { label: 'About Us',   to: '/about'   },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 style={{ color: theme.textPrimary }} className="text-sm font-semibold tracking-widest uppercase mb-4">
            Policies
          </h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Privacy Policy',     to: '/privacy'       },
              { label: 'Terms & Conditions', to: '/terms'         },
              { label: 'Return & Refund',    to: '/refund'        },
              { label: 'Cancellations',      to: '/cancellations' },
              { label: 'Shipping Policy',    to: '/shipping'      },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{ borderColor: theme.footerBorder }}
        className="border-t"
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} SNIIPE. All rights reserved.</p>
          <div className="flex items-center gap-2 opacity-60">
            <i className="fa-brands fa-cc-visa text-lg" />
            <i className="fa-brands fa-cc-mastercard text-lg" />
            <i className="fa-brands fa-cc-amex text-lg" />
            <span className="ml-1">Secure payments</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
