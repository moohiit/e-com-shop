import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', to: '/products' },
        { name: 'Featured', to: '/products?featured=true' },
        { name: 'New Arrivals', to: '/products?new=true' },
        { name: 'Sale', to: '/products?sale=true' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Contact Us', to: '/contact' },
        { name: 'FAQs', to: '/faqs' },
        { name: 'Shipping', to: '/shipping' },
        { name: 'Returns', to: '/returns' },
      ],
    },
    {
      title: 'About Us',
      links: [
        { name: 'Our Story', to: '/about' },
        { name: 'Careers', to: '/careers' },
        { name: 'Terms & Conditions', to: '/terms' },
        { name: 'Privacy Policy', to: '/privacy' },
      ],
    },
  ]

  const socialLinks = [
    { icon: <FaFacebook />, to: 'https://facebook.com' },
    { icon: <FaTwitter />, to: 'https://twitter.com' },
    { icon: <FaInstagram />, to: 'https://instagram.com' },
    { icon: <FaLinkedin />, to: 'https://linkedin.com' },
    { icon: <FaGithub />, to: 'https://github.com' },
  ]

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ShopEase
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Your one-stop shop for all your needs. We provide high quality products with excellent customer service.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Subscribe to our newsletter</h3>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Footer links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.to}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-600 dark:text-gray-400 space-y-2">
              <p>123 Main Street, City</p>
              <p>Country, ZIP Code</p>
              <p>Email: info@shopease.com</p>
              <p>Phone: +1 (123) 456-7890</p>
            </address>

            {/* Social Links */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xl transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
          <p>© {currentYear} ShopEase. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Designed and built with ❤️ by Your Name
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer