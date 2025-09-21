import { motion } from "framer-motion";
import { FaHeart, FaShoppingCart, FaEye } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../features/cart/cartSlice";
import { addToWishlist } from "../../features/wishlist/wishlistSlice";
import { useState } from "react";
import { toast } from "react-hot-toast";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Calculate final price
  const finalPrice = product.discountPercentage > 0 ?
    (product.basePrice * (1 - product.discountPercentage / 100)) : product.finalPrice;

  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
      dispatch(addItem({
        ...product,
        price: finalPrice,
        actualPrice: product.basePrice
      }));
      toast.success("Added to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setWishlistLoading(true);
      dispatch(addToWishlist({
        ...product,
        price: finalPrice
      }));
      toast.success("Added to wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300"
    >
      <div className="relative group">
        <LazyLoadImage
          src={product.images[0]?.imageUrl || "/placeholder-image.jpg"}
          alt={product.name}
          className="w-full h-56 object-cover"
          effect=""
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToWishlist}
            disabled={wishlistLoading}
            title="Add to Wishlist"
            className="bg-white p-2 rounded-full hover:bg-red-500 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaHeart />
          </button>

          <Link
            to={`/product/${product._id}`}
            title="View Details"
            className="bg-white p-2 rounded-full hover:bg-green-500 text-gray-500 hover:text-white transition-colors"
          >
            <FaEye />
          </Link>

          <button
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock <= 0}
            title="Add to Cart"
            className="bg-white p-2 rounded-full hover:bg-blue-500 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>

        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category) => (
                <span
                  key={category._id}
                  className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  {category.name}
                </span>
              ))}
              {product.categories.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{product.categories.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          {product.discountPercentage > 0 ? (
            <div className="flex gap-2 items-center">
              <span className="text-lg font-bold text-red-500">
                ₹{finalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{product.basePrice.toFixed(2)}
              </span>
              <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                {Math.round(product.discountPercentage)}% OFF
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold">₹{finalPrice.toFixed(2)}</span>
          )}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">{product.ratingsAverage || 0}</span>
            <span className="text-yellow-500">★</span>
          </div>
        </div>

        {/* Stock status */}
        <div className="mt-2">
          {product.stock > 0 ? (
            <span className="text-sm text-green-600">
              In Stock ({product.stock} available)
            </span>
          ) : (
            <span className="text-sm text-red-600">Out of Stock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;