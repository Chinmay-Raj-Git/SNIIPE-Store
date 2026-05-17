import PolicyPage from '../components/PolicyPage'
import PolicySection from '../components/PolicySection'

export default function Refund() {
  return (
    <PolicyPage title="Return & Refund Policy" updatedOn="Jan 3, 2026">

      <PolicySection title="Refund Policy">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Returns and refunds are not available at the moment.</li>
          <li>Please verify product details carefully before ordering.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Exchange Policy">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Exchanges allowed only for size-related issues.</li>
          <li>Request must be raised within 24 hours of delivery.</li>
          <li>₹200 exchange fee applies.</li>
          <li>One-time exchange only per order.</li>
          <li>If the requested size is out of stock, store credit will be issued.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Defective Items">
        <p>
          If you receive a defective or incorrect item, please contact us within 24
          hours of delivery with clear photographs. We will resolve the issue on a
          case-by-case basis.
        </p>
      </PolicySection>

    </PolicyPage>
  )
}
