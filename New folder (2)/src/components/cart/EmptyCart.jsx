import { Link } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'

export default function EmptyCart() {
  const { theme } = useTheme()
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: '96px', height: '96px', borderRadius: '50%',
        backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '28px',
      }}>
        <i className="fa-solid fa-bag-shopping" style={{ fontSize: '36px', color: theme.textMuted, opacity: 0.4 }} />
      </div>
      <p style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em',
        textTransform: 'uppercase', color: theme.primary, marginBottom: '12px',
      }}>
        Nothing here yet
      </p>
      <h2 className="font-heading" style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900,
        color: theme.textPrimary, marginBottom: '12px', lineHeight: 1,
      }}>
        Your Cart is Empty
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '15px', marginBottom: '36px', maxWidth: '380px' }}>
        Explore our latest drops and find something worth wearing.
      </p>
      <Link to="/home" style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '14px 32px', borderRadius: '12px', fontWeight: 700,
        fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase',
        textDecoration: 'none', color: '#fff',
        background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
        boxShadow: `0 8px 24px ${theme.primary}44`,
        transition: 'transform 0.2s ease',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <i className="fa-solid fa-bag-shopping" /> Shop Now
      </Link>
    </div>
  )
}
