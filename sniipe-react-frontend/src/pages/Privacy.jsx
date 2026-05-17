import { useTheme } from '../theme/ThemeContext'
import PolicyPage from '../components/PolicyPage'
import PolicySection from '../components/PolicySection'

export default function Privacy() {
  const { theme } = useTheme()

  return (
    <PolicyPage title="Privacy Policy" updatedOn="Jan 3, 2026">

      <PolicySection title="Our Commitment">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>SNIIPE Clothing values your privacy and is committed to protecting your personal data.</li>
          <li>We only use your information to process orders and improve your experience.</li>
          <li>Your data is never shared with anyone except trusted delivery and payment partners.</li>
          <li>
            For any concerns, contact us at{' '}
            <a
              href="mailto:sniipe.in@gmail.com"
              style={{ color: theme.primary, textDecoration: 'underline' }}
            >
              sniipe.in@gmail.com
            </a>
            .
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="What We Collect">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Name, email address, and phone number for order processing.</li>
          <li>Shipping address to deliver your orders.</li>
          <li>
            Payment information is processed securely via Razorpay and is never
            stored on our servers.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="How We Use Your Data">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>To process and fulfill your orders.</li>
          <li>To send order updates and shipping notifications.</li>
          <li>To improve our products and overall experience.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Third-Party Services">
        <p>
          We work with trusted third parties — Razorpay for payments and Shiprocket
          for logistics — who handle your data under their own privacy policies. We
          do not sell or rent your personal information to any other party.
        </p>
      </PolicySection>

    </PolicyPage>
  )
}
