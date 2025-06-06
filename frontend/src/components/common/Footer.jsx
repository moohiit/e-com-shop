import { Link } from 'react-router-dom'
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
} from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
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
    { icon: <FaFacebook />, to: 'https://facebook.com/profile.php?id=100008578542979' },
    { icon: <FaTwitter />, to: 'https://twitter.com/mooohiit' },
    { icon: <FaInstagram />, to: 'https://www.instagram.com/m.o.h.i.t.p.a.t.e.l/' },
    { icon: <FaLinkedin />, to: 'https://www.linkedin.com/in/mohit-patel-51338a245' },
    { icon: <FaGithub />, to: 'https://github.com/moohiit' },
  ]

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Logo and description */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              to="/"
              className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              ShopEase
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your one-stop shop for all your needs. High quality products with excellent customer service.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Subscribe to our newsletter</h3>
              <form className="flex flex-col sm:flex-row">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-grow px-4 py-2 rounded-md sm:rounded-l-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
                <button
                  type="submit"
                  className="mt-2 sm:mt-0 sm:ml-2 px-4 py-2 bg-blue-600 text-white rounded-md sm:rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Footer links */}
          {footerLinks.map((section, index) => (
            <div key={index} className="text-center sm:text-left">
              <h3 className="text-md font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.to}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info + Socials */}
          <div className="text-center sm:text-left">
            <h3 className="text-md font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-sm space-y-2 text-gray-600 dark:text-gray-400">
              <p>Sector 44, Gurugram, Haryana</p>
              <p>India, 262406</p>
              <p>Email: info@shopease.com</p>
              <p>Phone: +91 (706) 099-3268</p>
            </address>

            <div className="mt-6 ">
              <h3 className="text-md font-semibold mb-3">Follow Us</h3>
              <div className="flex space-x-4 text-xl justify-center sm:justify-start">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors "
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {currentYear} ShopEase. All rights reserved.</p>
          <p className="mt-1">Designed and built with ❤️ by Mohit Patel</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
