import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, Truck } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../../features/wishlist/wishlistSlice";
import { toast } from "react-hot-toast";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/pricing";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlistItems) || [];

  const inWishlist = wishlist.some((w) => w._id === product._id);

  const stock = Number(product.stock ?? 0);
  const lowStockThreshold = Number(product.lowStockThreshold ?? 5);
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= lowStockThreshold;

  const basePrice = Number(product.basePrice ?? 0);
  const finalPrice = Number(product.finalPrice ?? basePrice);
  const discountPct = Number(product.discountPercentage ?? 0);
  const youSave = Math.max(0, basePrice - finalPrice);

  const rating = Number(product.ratingsAverage ?? 0);
  const numReviews = Number(product.numReviews ?? 0);
  const freeShipping = finalPrice > FREE_SHIPPING_THRESHOLD;

  const handleAddToCart = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    dispatch(addItem(product));
    toast.success("Added to cart");
  };

  const handleToggleWishlist = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (inWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product));
      toast.success("Added to wishlist");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "tween", duration: 0.2 }}
      className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 flex flex-col"
    >
      {/* Image area */}
      <Link
        to={`/product/${product._id}`}
        aria-label={`View details for ${product.name}`}
        className="relative block overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        <LazyLoadImage
          src={product.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
          alt={product.name}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
          effect=""
        />

        {/* Discount badge */}
        {discountPct > 0 && !isOutOfStock && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
            -{Math.round(discountPct)}%
          </span>
        )}

        {/* Stock badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-gray-900/80 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 bg-amber-500/95 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            Only {stock} left
          </span>
        ) : null}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/50 backdrop-blur-[1px]" />
        )}

        {/* Hover quick-action: View details */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center pb-3 pointer-events-none">
          <span className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur text-gray-800 dark:text-gray-100 text-xs font-medium rounded-full shadow-lg">
            <Eye size={13} /> Quick view
          </span>
        </div>
      </Link>

      {/* Wishlist toggle — always visible */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={inWishlist}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
          isOutOfStock || isLowStock ? "top-12" : ""
        } ${
          inWishlist
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white/95 dark:bg-gray-800/95 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
        }`}
      >
        <Heart
          size={16}
          className={inWishlist ? "fill-current" : ""}
        />
      </button>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <Link
          to={`/product/${product._id}`}
          className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                className={
                  star <= Math.round(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {rating > 0 ? rating.toFixed(1) : "New"}
            {numReviews > 0 && ` (${numReviews})`}
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ₹{finalPrice.toFixed(2)}
          </span>
          {discountPct > 0 && basePrice > finalPrice && (
            <>
              <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                ₹{basePrice.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                Save ₹{youSave.toFixed(0)}
              </span>
            </>
          )}
        </div>

        {/* Free shipping hint */}
        {freeShipping && !isOutOfStock && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-medium">
            <Truck size={12} /> Free delivery
          </p>
        )}

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1" />

        {/* Add-to-cart CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-4 w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            isOutOfStock
              ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
          }`}
        >
          <ShoppingCart size={15} />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
