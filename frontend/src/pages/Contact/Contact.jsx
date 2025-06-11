import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you could send data to an API or email service
    console.log('Contact Form Submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Have a question or need support? We’re here to help. Reach out to the ShopEase team and we’ll respond as soon as possible.
        </p>
      </section>

      {/* Contact Info + Form */}
      <section className="px-6 pb-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300">
            <li>
              <strong>Email:</strong> support@shopease.com
            </li>
            <li>
              <strong>Phone:</strong> +1 (800) 123-4567
            </li>
            <li>
              <strong>Location:</strong> 123 E-Commerce Blvd, Tech City, USA
            </li>
            <li>
              <strong>Hours:</strong> Mon–Fri, 9 AM – 6 PM
            </li>
          </ul>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h2 className="text-2xl font-semibold mb-2">Send Us a Message</h2>

          {submitted && (
            <p className="text-green-600 dark:text-green-400 font-medium">Thanks! We’ll be in touch soon.</p>
          )}

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
          />

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}

export default Contact;
