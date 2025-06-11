import { Link } from "react-router-dom";

function About() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">About ShopEase</h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Welcome to{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            ShopEase
          </span>
          , your one-stop online destination for everything from fashion to
          electronics. We're redefining online shopping — easy, fast, and
          trustworthy.
        </p>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300">
            At ShopEase, our mission is to empower buyers and sellers by
            creating a seamless and secure shopping experience. Whether you're
            purchasing your favorite products or growing your brand, we’re here
            to make e-commerce effortless.
          </p>
        </div>
      </section>

      {/* Why Choose ShopEase */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-2">Wide Product Range</h3>
            <p className="text-gray-600 dark:text-gray-300">
              From fashion and home decor to gadgets and groceries — find it all
              in one place.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-2">Trusted Sellers</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Every seller is verified to ensure quality and service.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We use modern encryption and secure gateways to protect your
              transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="px-6 py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Meet the Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "Mohit Patel", role: "Founder & CEO", image:"https://avatars.githubusercontent.com/u/109367447?v=4" },
              { name: "Prahlad Singh", role: "CTO", image:"https://avatars.githubusercontent.com/u/109367447?v=4" },
              { name: "Rahul Verma", role: "Lead Designer", image:"https://avatars.githubusercontent.com/u/109367447?v=4" },
            ].map((member) => (
              <div
                key={member.name}
                className="bg-white dark:bg-gray-700 p-4 rounded shadow"
              >
                <div className="h-24 w-24 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" >
                  <img className="w-full h-full rounded-full" src={member.image} alt="Image" />
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Join the ShopEase Experience
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Whether you're a customer looking for great deals or a seller ready to
          grow your business — ShopEase is here for you.
        </p>
        <Link
          to="/auth/register"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}

export default About;
