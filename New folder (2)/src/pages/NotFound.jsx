import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'

export default function NotFound() {
  const { theme } = useTheme()

  return (
    <div
      style={{
        backgroundColor: theme.background,
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      {/* Giant 404 */}
      <h1
        className="font-heading"
        style={{
          fontSize: 'clamp(6rem, 20vw, 14rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: theme.primary,
          opacity: 0.15,
          marginBottom: '-16px',
          userSelect: 'none',
        }}
      >
        404
      </h1>

      {/* Icon */}
      <div
        style={{
          width: '72px', height: '72px', borderRadius: '50%',
          backgroundColor: theme.primaryMuted,
          border: `1px solid ${theme.primary}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <i className="fa-solid fa-ghost" style={{ fontSize: '28px', color: theme.primary }} />
      </div>

      <h2
        className="font-heading"
        style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900,
          color: theme.textPrimary,
          marginBottom: '12px',
        }}
      >
        Page Not Found
      </h2>

      <p style={{ color: theme.textSecondary, fontSize: '15px', maxWidth: '380px', marginBottom: '36px', lineHeight: 1.7 }}>
        Looks like this page took a limited drop. It doesn't exist or may have moved.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/home"
          style={{
            padding: '12px 28px', borderRadius: '10px', fontWeight: 700,
            fontSize: '14px', textDecoration: 'none', letterSpacing: '0.05em',
            background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
            color: '#fff',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <i className="fa-solid fa-bag-shopping" />
          Browse Shop
        </Link>
        <Link
          to="/"
          style={{
            padding: '12px 28px', borderRadius: '10px', fontWeight: 700,
            fontSize: '14px', textDecoration: 'none', letterSpacing: '0.05em',
            border: `1.5px solid ${theme.border}`,
            color: theme.textSecondary,
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
