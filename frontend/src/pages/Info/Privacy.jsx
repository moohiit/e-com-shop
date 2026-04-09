import InfoPage, { Section } from "./InfoPage";

const Privacy = () => (
  <InfoPage
    title="Privacy Policy"
    subtitle="Your privacy matters. Here's how we collect, use, and protect your information."
    lastUpdated="April 2026"
  >
    <Section heading="1. Information We Collect">
      <p>We collect information you provide directly to us, such as:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Account details — name, email, phone number, and password.</li>
        <li>Shipping and billing addresses.</li>
        <li>Order history and payment metadata (we never store full card numbers).</li>
        <li>Communication you send us through chat, email, or contact forms.</li>
      </ul>
      <p>
        We also collect technical data automatically — IP address, browser type, device
        information, and basic usage analytics.
      </p>
    </Section>

    <Section heading="2. How We Use Your Information">
      <ul className="list-disc list-inside space-y-1">
        <li>To process and deliver your orders.</li>
        <li>To send order updates, receipts, and customer-service communication.</li>
        <li>To improve our products, services, and security.</li>
        <li>To prevent fraud and enforce our terms.</li>
        <li>To send marketing emails — only if you've opted in.</li>
      </ul>
    </Section>

    <Section heading="3. Sharing Your Information">
      <p>
        We never sell your personal data. We share information only with:
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li>Sellers, to fulfill the orders you place with them.</li>
        <li>Payment processors (e.g. Razorpay), to charge you for purchases.</li>
        <li>Logistics partners, to deliver your orders.</li>
        <li>Authorities, when required by law.</li>
      </ul>
    </Section>

    <Section heading="4. Cookies">
      <p>
        We use cookies and similar technologies to keep you signed in, remember your
        preferences, and understand how the site is used. You can disable cookies in your
        browser, but some parts of the site may not work properly.
      </p>
    </Section>

    <Section heading="5. Data Security">
      <p>
        We use industry-standard encryption (HTTPS, hashed passwords) and security best
        practices to protect your data. Payments are handled by PCI-DSS-compliant gateways. No
        system is 100% secure, but we take every reasonable precaution.
      </p>
    </Section>

    <Section heading="6. Your Rights">
      <p>You have the right to:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Access the personal data we hold about you.</li>
        <li>Correct or update your information from your profile page.</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Opt out of marketing communications at any time.</li>
      </ul>
    </Section>

    <Section heading="7. Children's Privacy">
      <p>
        ShopEase is not intended for users under 18. We do not knowingly collect personal
        information from children.
      </p>
    </Section>

    <Section heading="8. Changes to This Policy">
      <p>
        We may update this privacy policy occasionally. Material changes will be communicated
        via email or a prominent notice on the platform.
      </p>
    </Section>

    <Section heading="9. Contact Us">
      <p>
        Questions or concerns about your privacy? Email us at{" "}
        <a
          href="mailto:privacy@shopease.com"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          privacy@shopease.com
        </a>
        .
      </p>
    </Section>
  </InfoPage>
);

export default Privacy;
