import InfoPage, { Section } from "./InfoPage";

const Shipping = () => (
  <InfoPage
    title="Shipping Information"
    subtitle="Everything you need to know about how and when your order will arrive."
  >
    <Section heading="Delivery Times">
      <p>
        Most orders are dispatched within 1–2 business days of being placed. Standard delivery
        usually takes 3–7 business days depending on your location. You'll see an estimated
        delivery date for each item at checkout.
      </p>
    </Section>

    <Section heading="Shipping Charges">
      <p>
        We offer <strong>free shipping</strong> on all orders above ₹500. For orders below ₹500,
        a flat shipping fee of <strong>₹50</strong> is applied at checkout.
      </p>
    </Section>

    <Section heading="Order Tracking">
      <p>
        Once your order ships, you can track it from the{" "}
        <strong>My Orders</strong> page in your account. We also send you status updates by
        email at every stage — confirmation, shipment, out-for-delivery, and delivered.
      </p>
    </Section>

    <Section heading="Serviceable Locations">
      <p>
        We currently deliver across India to all serviceable pincodes. International shipping is
        not yet available. If your pincode is not serviceable, you'll see a notice at checkout.
      </p>
    </Section>

    <Section heading="Failed Deliveries">
      <p>
        If a delivery attempt fails, our courier partner will retry up to two more times. If the
        order still cannot be delivered, it will be returned to us and a refund will be issued
        for prepaid orders.
      </p>
    </Section>
  </InfoPage>
);

export default Shipping;
