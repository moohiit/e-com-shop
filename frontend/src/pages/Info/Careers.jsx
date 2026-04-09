import { Link } from "react-router-dom";
import InfoPage, { Section } from "./InfoPage";

const Careers = () => (
  <InfoPage
    title="Careers at ShopEase"
    subtitle="Help us build the future of e-commerce in India. We're always looking for curious, driven people to join our team."
  >
    <Section heading="Why ShopEase?">
      <ul className="list-disc list-inside space-y-1">
        <li>Work on a fast-growing platform used by thousands of buyers and sellers.</li>
        <li>Small teams, big ownership — your work ships every week.</li>
        <li>Remote-friendly culture with regular team offsites.</li>
        <li>Competitive compensation, ESOPs, and learning budgets.</li>
      </ul>
    </Section>

    <Section heading="Open Roles">
      <p>
        We don't have any open positions listed publicly right now, but we're always interested
        in hearing from talented engineers, designers, product managers, and customer-success
        specialists.
      </p>
      <p>
        Send your résumé and a short note about what you'd like to work on to{" "}
        <a
          href="mailto:careers@shopease.com"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          careers@shopease.com
        </a>
        .
      </p>
    </Section>

    <Section heading="Are you a seller?">
      <p>
        If you'd like to sell your products on ShopEase instead, head over to our seller
        application page.
      </p>
      <Link
        to="/sell-on-shopease"
        className="inline-block mt-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Apply as a Seller
      </Link>
    </Section>
  </InfoPage>
);

export default Careers;
