import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShoppingBag, FiTruck, FiShield, FiHeadphones, FiStar, FiTrendingUp } from 'react-icons/fi';

function Home() {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  const userName = user?.name || 'Guest';

  // Featured categories data
  const categories = [
    { id: 1, name: 'Electronics', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03' },
    { id: 2, name: 'Fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b' },
    { id: 3, name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803' },
    { id: 4, name: 'Books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d' },
  ];

  // Featured products data
  const featuredProducts = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, image: 'https://source.unsplash.com/random/300x200/?headphones' },
    { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://source.unsplash.com/random/300x200/?smartwatch' },
    { id: 3, name: 'Bluetooth Speaker', price: 79.99, image: 'https://source.unsplash.com/random/300x200/?speaker' },
    { id: 4, name: 'Gaming Keyboard', price: 129.99, image: 'https://source.unsplash.com/random/300x200/?keyboard' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-20"></div>
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">
            Welcome to <span className="text-yellow-300">ShopEase</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl mb-8">
            Discover amazing products at unbeatable prices
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <FiShoppingBag className="mr-2" />
              Shop Now
            </Link>
            {!role && (
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Join Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Role-based Section */}
      <section className="px-6 py-16 max-w-6xl mx-auto space-y-8">
        {role === 'admin' && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 text-white p-8 rounded-xl shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-indigo-100 max-w-2xl">
                  Manage the entire platform - from products and users to analytics and system settings.
                </p>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow transition-all"
              >
                Go to Admin Panel
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        )}

        {role === 'seller' && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white p-8 rounded-xl shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Seller Center</h2>
                <p className="text-amber-100 max-w-2xl">
                  Grow your business with powerful tools to manage products, orders, and analytics.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  to="/seller/products"
                  className="inline-flex items-center bg-white text-amber-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow transition-all"
                >
                  Manage Products
                </Link>
                <Link
                  to="/seller/dashboard"
                  className="inline-flex items-center bg-transparent border-2 border-white hover:bg-white hover:text-amber-600 px-6 py-3 rounded-lg font-medium transition-all"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        )}

        {role === 'user' && (
          <div className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white p-8 rounded-xl shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
                <p className="text-green-100 max-w-2xl">
                  Your recent orders are on the way. Check out our new arrivals and exclusive deals just for you.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  to="/my-orders"
                  className="inline-flex items-center bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow transition-all"
                >
                  Your Orders
                </Link>
                <Link
                  to="/products?new=true"
                  className="inline-flex items-center bg-transparent border-2 border-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-lg font-medium transition-all"
                >
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>
        )}

        {!role && (
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white p-8 rounded-xl shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Join ShopEase Today</h2>
                <p className="text-gray-200 max-w-2xl">
                  Create an account to enjoy personalized recommendations, faster checkout, and exclusive member deals.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium shadow transition-all"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center bg-transparent border-2 border-white hover:bg-white hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-all"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          <Link to="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
            View all categories
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.name.toLowerCase()}`}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <h3 className="text-white text-lg font-semibold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-blue-600 dark:text-blue-400 hover:underline">
              View all products
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold">
                    Hot
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(24)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">${product.price}</span>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "ShopEase has the fastest delivery I've ever experienced. Ordered in the morning, received by evening!",
              author: "Sarah Johnson",
              role: "Premium Member"
            },
            {
              quote: "As a seller, the platform tools are incredibly powerful yet easy to use. My sales have doubled!",
              author: "Michael Chen",
              role: "Verified Seller"
            },
            {
              quote: "The customer support team resolved my issue within minutes. Truly exceptional service!",
              author: "David Wilson",
              role: "Loyal Customer"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className="w-5 h-5 inline-block fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                <div>
                  <h4 className="font-medium">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why Choose ShopEase</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast & Free Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enjoy free delivery on all orders over $50 with our lightning-fast shipping network.
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Shopping</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your security is our priority with 256-bit encryption and fraud protection.
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeadphones className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our dedicated support team is available round the clock to assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Shopping Experience?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join millions of happy customers and start shopping the smart way today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FiShoppingBag className="mr-2" />
              Start Shopping
            </Link>
            {!role && (
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;