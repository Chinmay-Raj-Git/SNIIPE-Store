import PolicyPage from '../components/PolicyPage'
import PolicySection from '../components/PolicySection'

export default function Terms() {
  return (
    <PolicyPage title="Terms & Conditions" updatedOn="Jan 3, 2026">

      <PolicySection title="Overview">
        <p>
          By accessing this website or placing an order with{' '}
          <strong style={{ fontWeight: 700 }}>SNIIPE Clothing</strong>, you agree to
          comply with the terms outlined below.
        </p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>No returns or refunds will be processed.</li>
          <li>Quality Assurance: products are quality-checked before shipping.</li>
          <li>If you receive a defective item, contact us within 24 hours with images.</li>
          <li>Please review sizing, fit, and product details carefully before ordering.</li>
          <li>Shipping timelines may vary due to external factors.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Orders & Payments">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>All prices are listed in INR and include applicable taxes.</li>
          <li>Orders are confirmed only after successful online payment.</li>
          <li>Cash on Delivery (COD) is currently not supported.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Exchanges">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Exchanges are allowed only for size-related issues.</li>
          <li>Must be requested within <strong style={{ fontWeight: 700 }}>24 hours</strong> of delivery.</li>
          <li>Exchange is allowed only once per order.</li>
          <li>A ₹200 exchange fee is applicable.</li>
          <li>Exchanges depend on stock availability.</li>
          <li>If stock is unavailable, store credit will be provided.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Pre-Purchase Responsibility">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Please review size charts, fit, and product details carefully.</li>
          <li>Orders placed cannot be modified after confirmation.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Shipping Timelines">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Shipping timelines are estimates and may vary.</li>
          <li>Delays due to courier or external factors are beyond our control.</li>
        </ul>
      </PolicySection>

    </PolicyPage>
  )
}
