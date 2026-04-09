import { Link } from "react-router-dom";

/**
 * Shared layout for static informational pages (FAQs, Shipping, Returns,
 * Careers, Terms, Privacy). Keeps the hero + section styling consistent
 * across all info pages without duplicating Tailwind class strings.
 */
const InfoPage = ({ title, subtitle, lastUpdated, children }) => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-[60vh]">
      {/* Hero */}
      <section className="px-6 py-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
        {subtitle && (
          <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-300">
            {subtitle}
          </p>
        )}
        {lastUpdated && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
        )}
      </section>

      {/* Body */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8">{children}</div>
      </section>

      {/* Help CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Still have questions? Our team is happy to help.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
};

export const Section = ({ heading, children }) => (
  <div>
    {heading && (
      <h2 className="text-xl md:text-2xl font-semibold mb-3">{heading}</h2>
    )}
    <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
      {children}
    </div>
  </div>
);

export default InfoPage;
