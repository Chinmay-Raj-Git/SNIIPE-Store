import { useTheme } from '../theme/ThemeContext'

/**
 * PolicyPage
 * Shared layout for all static/informational pages (About, Privacy, Terms, etc.)
 * Mirrors the backend's _policy_base.html structure and design.
 *
 * Usage:
 *   <PolicyPage title="Privacy Policy" updatedOn="Jan 3, 2026">
 *     <PolicySection title="Our Commitment">...</PolicySection>
 *   </PolicyPage>
 */
export default function PolicyPage({ title, updatedOn, children }) {
  const { theme } = useTheme()

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 96px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '40px', paddingBottom: '28px', borderBottom: `1px solid ${theme.border}` }}>
          <h1
            className="font-heading"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              color: theme.textPrimary,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              marginBottom: '10px',
            }}
          >
            {title}
          </h1>
          {updatedOn && (
            <p style={{ fontSize: '13px', color: theme.textMuted }}>
              Last updated on {updatedOn}
            </p>
          )}
        </div>

        {/* Page content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {children}
        </div>

      </div>
    </div>
  )
}
