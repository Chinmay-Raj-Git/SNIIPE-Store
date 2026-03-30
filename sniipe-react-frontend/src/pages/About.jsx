import { useTheme } from '../theme/ThemeContext'
import PolicyPage from '../components/PolicyPage'
import PolicySection from '../components/PolicySection'

export default function About() {
  const { theme } = useTheme()

  return (
    <PolicyPage title="About SNIIPE" updatedOn="Jan 3, 2026">

      <PolicySection title="Who We Are">
        <p>
          SNIIPE is a premium streetwear brand built for comfort, confidence, and
          culture. We design clothing that speaks for itself — bold, clean, and
          built to last.
        </p>
        <p>
          Our mission is simple: deliver quality streetwear that doesn't compromise
          on fit, fabric, or feel — and get it to you as fast as possible.
        </p>
      </PolicySection>

      <PolicySection title="What We Stand For">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Uncompromising quality on every piece we ship.</li>
          <li>Fair, transparent pricing with no hidden costs.</li>
          <li>Designs rooted in street culture and everyday wearability.</li>
          <li>A community-first approach — we listen, we adapt, we grow.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Our Promise">
        <p>
          Every item you receive from SNIIPE is quality-checked before it leaves
          our hands. If something isn't right, reach out and we'll make it right.
        </p>
      </PolicySection>

      <PolicySection title="Get in Touch">
        <p>
          For questions, collaborations, or just to say hi — drop us a line at{' '}
          <a
            href="mailto:sniipe.in@gmail.com"
            style={{ color: theme.primary, textDecoration: 'underline' }}
          >
            sniipe.in@gmail.com
          </a>{' '}
          or find us on Instagram at{' '}
          <a
            href="https://www.instagram.com/sniipe.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.primary, textDecoration: 'underline' }}
          >
            @sniipe.in
          </a>
          .
        </p>
      </PolicySection>

    </PolicyPage>
  )
}
