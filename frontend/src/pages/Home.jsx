// src/pages/Home.jsx
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to E-Shop!</h1>
      <p className="text-lg mb-4">Browse our latest products and deals.</p>
      <Link to="/products" className="text-blue-600 underline">Shop Now</Link>
    </div>
  );
}
