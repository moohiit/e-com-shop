import InfoPage, { Section } from "./InfoPage";

const Returns = () => (
  <InfoPage
    title="Returns & Refunds"
    subtitle="Not happy with your purchase? Here's how returns and refunds work at ShopEase."
  >
    <Section heading="Return Window">
      <p>
        You can request a return within <strong>7 days of delivery</strong>. Most products are
        eligible for return as long as they're unused, in their original packaging, and accompanied
        by the original invoice.
      </p>
    </Section>

    <Section heading="Non-Returnable Items">
      <p>
        Some items cannot be returned for hygiene, safety, or customisation reasons. These
        include innerwear, perishables, personal care products, and made-to-order items. The
        product page will indicate if an item is non-returnable.
      </p>
    </Section>

    <Section heading="How to Request a Return">
      <ol className="list-decimal list-inside space-y-1">
        <li>Go to <strong>My Orders</strong> in your account.</li>
        <li>Open the order and click <strong>Request Return</strong> on the eligible item.</li>
        <li>Select a reason and submit. The seller will review and approve your request.</li>
        <li>Once approved, our courier will pick up the item from your address.</li>
      </ol>
    </Section>

    <Section heading="Refund Timelines">
      <p>
        Refunds are processed automatically as soon as your return is approved.
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>Online payments:</strong> Refunded to the original payment method within 5–7 business days.</li>
        <li><strong>Cash on Delivery:</strong> Refunded to your bank account once verified (3–5 business days).</li>
      </ul>
    </Section>

    <Section heading="Order Cancellations">
      <p>
        You can cancel any order item that hasn't shipped yet directly from the order details
        page. Refunds for cancelled prepaid orders are issued instantly to your original payment
        method.
      </p>
    </Section>
  </InfoPage>
);

export default Returns;
