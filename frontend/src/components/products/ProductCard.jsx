import { motion } from "framer-motion";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaStar,
  FaCheck,
  FaTrash,
} from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItem, deleteItem } from "../../features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../features/wishlist/wishlistSlice";
import { useState } from "react";
import { toast } from "react-hot-toast";

const ProductCard = ({
  product,
  viewMode = "grid",
  inCart = false,
  inWishlist = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  // Check stock status
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    try {
      setCartLoading(true);
      dispatch(addItem(product));
      toast.success("Added to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      setCartLoading(true);
      dispatch(deleteItem(product._id));
      toast.success("Removed from cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    
    try {
      setBuyNowLoading(true);
      if (!inCart) {
        dispatch(addItem(product));
      }
      navigate("/cart");
    } finally {
      setBuyNowLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      setWishlistLoading(true);
      if (inWishlist) {
        dispatch(removeFromWishlist(product._id));
        toast.success("Removed from wishlist");
      } else {
        dispatch(addToWishlist(product));
        toast.success("Added to wishlist");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // Grid view layout
  if (viewMode === "grid") {
    return (
      <motion.div
        whileHover={isOutOfStock ? {} : { y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 flex flex-col h-full relative"
      >
        {/* Low Stock Badge */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Only {product.stock} left!
          </div>
        )}

        <div className="relative w-full flex-shrink-0">
          {/* Wishlist icon on top right corner */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading || isOutOfStock}
            className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-colors disabled:opacity-50 ${
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-500 hover:bg-red-500 hover:text-white"
            } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <FaHeart size={16} />
          </button>

          {/* Add wrapper div with w-full class */}
          <div className="w-full">
            <LazyLoadImage
              src={product.images[0]?.imageUrl || "/placeholder-image.jpg"}
              alt={product.name}
              className={`w-full h-56 object-cover ${isOutOfStock ? "opacity-60" : ""}`}
              effect="opacity"
              placeholderSrc="/placeholder-image.jpg"
              wrapperClassName="w-full"
            />
          </div>

          {/* Hover actions for desktop - hidden when out of stock */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 hidden md:flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
              <Link
                to={`/product/${product._id}`}
                title="View Details"
                className="bg-white p-2 rounded-full hover:bg-green-500 text-gray-500 hover:text-white transition-colors"
              >
                <FaEye />
              </Link>

              {!inCart ? (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  title="Add to Cart"
                  className="bg-white p-2 rounded-full hover:bg-blue-500 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  <FaShoppingCart />
                </button>
              ) : (
                <button
                  onClick={handleRemoveFromCart}
                  disabled={cartLoading}
                  title="Remove from Cart"
                  className="bg-white p-2 rounded-full hover:bg-red-500 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/product/${product._id}`}>
            <h3 className={`font-semibold text-lg mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 ${isOutOfStock ? "text-gray-400" : ""}`}>
              {product.name}
            </h3>
          </Link>

          {product.brand && (
            <p className={`text-sm mb-2 ${isOutOfStock ? "text-gray-400" : "text-gray-500"}`}>
              By {product.brand}
            </p>
          )}

          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
                size={14}
              />
            ))}
            <span className={`text-sm ml-2 ${isOutOfStock ? "text-gray-400" : "text-gray-500"}`}>
              ({product.reviewCount || 0})
            </span>
          </div>

          <p className={`text-sm mb-4 line-clamp-2 flex-grow ${isOutOfStock ? "text-gray-400" : "text-gray-600 dark:text-gray-400"}`}>
            {product.description || "No description available"}
          </p>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex flex-col">
              {product.discountPrice ? (
                <>
                  <span className={`text-lg font-bold ${isOutOfStock ? "text-gray-400" : "text-red-500"}`}>
                    ₹{product.discountPrice}
                  </span>
                  <span className={`text-sm line-through ${isOutOfStock ? "text-gray-400" : "text-gray-500"}`}>
                    ₹{product.price}
                  </span>
                </>
              ) : (
                <span className={`text-lg font-bold ${isOutOfStock ? "text-gray-400" : ""}`}>
                  ₹{product.price}
                </span>
              )}
              {isOutOfStock && (
                <p className="text-red-500 font-semibold text-sm mt-1">Out of Stock</p>
              )}
            </div>
          </div>

          {/* Action buttons - hidden when out of stock */}
          {!isOutOfStock && (
            <div className="flex gap-2 mt-4">
              {inCart ? (
                <>
                  <button
                    onClick={handleRemoveFromCart}
                    disabled={cartLoading}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaTrash size={14} />
                    <span>Remove</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyNowLoading}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaCheck size={14} />
                    <span>Buy Now</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart size={14} />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyNowLoading}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaCheck size={14} />
                    <span>Buy Now</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // List view layout
  return (
    <motion.div
      whileHover={isOutOfStock ? {} : { x: 5 }}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 flex flex-col md:flex-row h-full relative"
    >
      {/* Low Stock Badge for list view */}
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          Only {product.stock} left!
        </div>
      )}

      <div className="relative flex-shrink-0 md:w-48">
        {/* Wishlist icon on top right corner for list view */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading || isOutOfStock}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-colors disabled:opacity-50 ${
            inWishlist
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-500 hover:bg-red-500 hover:text-white"
          } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FaHeart size={16} />
        </button>

        <div className="w-full">
          <LazyLoadImage
            src={product.images[0]?.imageUrl || "/placeholder-image.jpg"}
            alt={product.name}
            className={`w-full h-48 md:h-full object-cover ${isOutOfStock ? "opacity-60" : ""}`}
            effect="opacity"
            placeholderSrc="/placeholder-image.jpg"
            wrapperClassName="w-full"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`}>
          <h3 className={`font-semibold text-lg mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isOutOfStock ? "text-gray-400" : ""}`}>
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className={`text-sm mb-2 ${isOutOfStock ? "text-gray-400" : "text-gray-500"}`}>
            By {product.brand}
          </p>
        )}

        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={
                i < Math.floor(product.rating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
              size={14}
            />
          ))}
          <span className={`text-sm ml-2 ${isOutOfStock ? "text-gray-400" : "text-gray-500"}`}>
            ({product.reviewCount || 0})
          </span>
        </div>

        <p className={`text-sm mb-4 flex-grow ${isOutOfStock ? "text-gray-400" : "text-gray-600 dark:text-gray-400"}`}>
          {product.description || "No description available"}
        </p>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className={`text-lg font-bold ${isOutOfStock ? "text-gray-400" : "text-red-500"}`}>
                  ₹{product.discountPrice}
                </span>
                <span className={`text-sm line-through ${isOutOfStock ? "text-gray-400" : "text-gray-500"}`}>
                  ₹{product.price}
                </span>
              </>
            ) : (
              <span className={`text-lg font-bold ${isOutOfStock ? "text-gray-400" : ""}`}>
                ₹{product.price}
              </span>
            )}
            {isOutOfStock && (
              <p className="text-red-500 font-semibold text-sm mt-1">Out of Stock</p>
            )}
          </div>

          {/* Action buttons - hidden when out of stock */}
          {!isOutOfStock && (
            <div className="flex gap-2">
              <Link
                to={`/product/${product._id}`}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                title="View Details"
              >
                <FaEye className="text-green-500" size={16} />
              </Link>

              {inCart ? (
                <>
                  <button
                    onClick={handleRemoveFromCart}
                    disabled={cartLoading}
                    className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors disabled:opacity-50"
                    title="Remove from Cart"
                  >
                    <FaTrash className="text-red-500" size={16} />
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyNowLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaCheck size={14} />
                    <span>Buy Now</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors disabled:opacity-50"
                    title="Add to Cart"
                  >
                    <FaShoppingCart className="text-blue-500" size={16} />
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyNowLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaCheck size={14} />
                    <span>Buy Now</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;