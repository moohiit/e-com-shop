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

  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
      dispatch(addItem(product));
      toast.success("Added to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setWishlistLoading(true);
      dispatch(addToWishlist(product));
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
          src={product.images[0].imageUrl}
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
            disabled={cartLoading}
            title="Add to Cart"
            className="bg-white p-2 rounded-full hover:bg-blue-500 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
        <div className="flex justify-between items-center">
          {product.discountPrice ? (
            <div className="flex gap-2 items-center">
              <span className="text-lg font-bold text-red-500">
                ₹{product.discountPrice}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{product.price}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold">₹{product.price}</span>
          )}
          <span className="text-sm text-gray-500">{product.rating || 0} ★</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;