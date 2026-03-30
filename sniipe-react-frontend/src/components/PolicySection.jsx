import { useTheme } from '../theme/ThemeContext'

/**
 * PolicySection
 * A titled content block for use inside PolicyPage.
 *
 * Usage:
 *   <PolicySection title="Overview">
 *     <p>Some text...</p>
 *     <ul>...</ul>
 *   </PolicySection>
 */
export default function PolicySection({ title, children }) {
  const { theme } = useTheme()

  return (
    <section>
      {title && (
        <h2
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: theme.primary,
            marginBottom: '14px',
          }}
        >
          {title}
        </h2>
      )}
      <div
        style={{
          color: theme.textSecondary,
          fontSize: '15px',
          lineHeight: '1.75',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {children}
      </div>
    </section>
  )
}
