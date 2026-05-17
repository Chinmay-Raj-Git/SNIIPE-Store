import PolicyPage from '../components/PolicyPage'
import PolicySection from '../components/PolicySection'

export default function Shipping() {
  return (
    <PolicyPage title="Shipping & Delivery Policy" updatedOn="Jan 3, 2026">

      <PolicySection title="Shipping Overview">
        <p>
          Orders are shipped using trusted courier partners through Shiprocket.
          We aim to dispatch every order as quickly as possible so your items
          reach you in the best condition and shortest time.
        </p>
      </PolicySection>

      <PolicySection title="Processing Time">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Orders are typically processed within 24–48 hours of payment confirmation.</li>
          <li>Orders placed on weekends or public holidays are processed the next working day.</li>
          <li>You will receive a confirmation email once your order has been dispatched.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Delivery Timelines">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Delivery timelines vary by location.</li>
          <li>Estimated delivery is shared after order confirmation.</li>
          <li>Most orders within India are delivered within 3–7 business days.</li>
          <li>Remote or difficult-to-access locations may take additional time.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Delivery Coverage">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>We currently ship across India.</li>
          <li>International shipping is not available at this time.</li>
          <li>Free shipping is included on all orders — no delivery charges.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Delays & Issues">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Delays may occur due to weather, courier, or operational issues.</li>
          <li>SNIIPE Clothing is not liable for external delivery delays.</li>
          <li>If your order is significantly delayed, please reach out to us and we'll investigate with the courier.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Tracking Your Order">
        <p>
          Once your order is dispatched, tracking details will be available in
          your{' '}
          <a href="/orders" style={{ color: 'inherit', textDecoration: 'underline' }}>
            My Orders
          </a>{' '}
          page. You can also contact us at{' '}
          <a href="mailto:sniipe.in@gmail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>
            sniipe.in@gmail.com
          </a>{' '}
          for any shipping queries.
        </p>
      </PolicySection>

    </PolicyPage>
  )
}
