import { useTheme } from '../theme/ThemeContext'
import PolicyPage from '../components/PolicyPage'
import PolicySection from '../components/PolicySection'

export default function Cancellations() {
  const { theme } = useTheme()

  return (
    <PolicyPage title="Cancellations Policy" updatedOn="Jan 3, 2026">

      <PolicySection title="Our Policy">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>We currently do not offer order cancellations once the order is placed.</li>
          <li>Every order is handled carefully and shipped promptly.</li>
          <li>Please review your details carefully before confirming your purchase.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Why We Can't Cancel">
        <p>
          Once an order is confirmed and payment is received, it enters processing
          immediately to ensure the fastest possible dispatch. This means we cannot
          pause or cancel the fulfillment process.
        </p>
      </PolicySection>

      <PolicySection title="Need Help?">
        <p>
          If you placed an order by mistake or need assistance, please contact us
          as soon as possible at{' '}
          <a
            href="mailto:sniipe.in@gmail.com"
            style={{ color: theme.primary, textDecoration: 'underline' }}
          >
            sniipe.in@gmail.com
          </a>{' '}
          or reach us on{' '}
          <a
            href="https://wa.me/+917207701175"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.primary, textDecoration: 'underline' }}
          >
            WhatsApp
          </a>
          . While we cannot guarantee cancellation, we'll do our best to help.
        </p>
      </PolicySection>

    </PolicyPage>
  )
}
