import InfoPage, { Section } from "./InfoPage";

const Terms = () => (
  <InfoPage
    title="Terms & Conditions"
    subtitle="Please read these terms carefully before using ShopEase."
    lastUpdated="April 2026"
  >
    <Section heading="1. Acceptance of Terms">
      <p>
        By accessing or using ShopEase, you agree to be bound by these Terms & Conditions and
        our Privacy Policy. If you do not agree, please do not use the platform.
      </p>
    </Section>

    <Section heading="2. Account Registration">
      <p>
        You must provide accurate and complete information when creating an account. You are
        responsible for keeping your password secure and for all activity that occurs under your
        account. Notify us immediately of any unauthorised use.
      </p>
    </Section>

    <Section heading="3. Orders and Payments">
      <p>
        All orders are subject to product availability and acceptance by the seller. Prices are
        listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise. We
        reserve the right to cancel or refuse any order at our discretion.
      </p>
    </Section>

    <Section heading="4. User Conduct">
      <p>You agree not to:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Use the platform for any unlawful or fraudulent purpose.</li>
        <li>Post false, misleading, or defamatory reviews.</li>
        <li>Attempt to gain unauthorised access to any part of the platform.</li>
        <li>Interfere with the proper functioning of the website or services.</li>
      </ul>
    </Section>

    <Section heading="5. Seller Responsibilities">
      <p>
        Sellers are responsible for the accuracy of their product listings, fulfillment of
        orders, and compliance with all applicable laws. ShopEase acts as a marketplace and is
        not the manufacturer or seller of the goods listed by third-party sellers.
      </p>
    </Section>

    <Section heading="6. Intellectual Property">
      <p>
        All content on ShopEase — including logos, text, graphics, and software — is the
        property of ShopEase or its licensors and is protected by intellectual-property laws.
      </p>
    </Section>

    <Section heading="7. Limitation of Liability">
      <p>
        ShopEase is not liable for any indirect, incidental, or consequential damages arising
        out of your use of the platform. Our total liability is limited to the amount you paid
        for the order in question.
      </p>
    </Section>

    <Section heading="8. Changes to These Terms">
      <p>
        We may update these terms from time to time. Significant changes will be communicated
        via email or a notice on the platform. Continued use of ShopEase after changes
        constitutes acceptance of the updated terms.
      </p>
    </Section>

    <Section heading="9. Contact">
      <p>
        Questions about these terms? Reach us at{" "}
        <a
          href="mailto:legal@shopease.com"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          legal@shopease.com
        </a>
        .
      </p>
    </Section>
  </InfoPage>
);

export default Terms;
