import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Rating from "../common/Rating";

function RecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
          >
            <img
              src={product.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
              alt={product.name}
              className="w-full h-32 object-cover"
            />
            <div className="p-2">
              <h3 className="text-xs font-medium truncate">{product.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="font-bold text-sm">
                  ₹{(product.finalPrice || product.basePrice)?.toFixed(2)}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="text-xs text-red-500">
                    {Math.round(product.discountPercentage)}%
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewed;
