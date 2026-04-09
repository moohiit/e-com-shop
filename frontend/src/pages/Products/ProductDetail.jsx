import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetProductByIdQuery,
  useGetRelatedProductsQuery,
} from "../../features/products/productApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlist,
} from "../../features/wishlist/wishlistSlice";
import {
  useAddToWishlistApiMutation,
  useRemoveFromWishlistApiMutation,
} from "../../features/wishlist/wishlistApiSlice";
import {
  Heart,
  Loader2,
  ShoppingCart,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  Minus,
  Plus,
  ChevronRight,
  Store,
} from "lucide-react";
import { useGetOrCreateConversationMutation } from "../../features/chat/chatApiSlice";
import { motion } from "framer-motion";
import Rating from "../../components/common/Rating";
import ReviewForm from "../../components/reviews/ReviewForm";
import ReviewList from "../../components/reviews/ReviewList";
import ProductCard from "../../components/products/ProductCard";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/pricing";
import toast from "react-hot-toast";

// Recently viewed helper
const addToRecentlyViewed = (product) => {
  try {
    const stored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const filtered = stored.filter((p) => p._id !== product._id);
    filtered.unshift({
      _id: product._id,
      name: product.name,
      basePrice: product.basePrice,
      finalPrice: product.finalPrice,
      discountPercentage: product.discountPercentage,
      images: product.images?.slice(0, 1),
      ratingsAverage: product.ratingsAverage,
    });
    localStorage.setItem(
      "recentlyViewed",
      JSON.stringify(filtered.slice(0, 12))
    );
  } catch {}
};

const TRUST_BADGES = [
  { icon: Truck, label: "Free Delivery", sub: "On orders above ₹500" },
  { icon: RotateCcw, label: "Easy Returns", sub: "7-day return policy" },
  { icon: ShieldCheck, label: "Secure Payment", sub: "Razorpay protected" },
  { icon: Lock, label: "Buyer Protection", sub: "100% genuine products" },
];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const wishlist = useSelector(selectWishlist);

  const { data: productData, isLoading, isError } = useGetProductByIdQuery(id);
  const { data: relatedData } = useGetRelatedProductsQuery(id, { skip: !id });

  const { user } = useSelector((state) => state.auth);
  const [addToApi] = useAddToWishlistApiMutation();
  const [removeFromApi] = useRemoveFromWishlistApiMutation();
  const [createConversation] = useGetOrCreateConversationMutation();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (productData?.product && wishlist) {
      setIsInWishlist(
        wishlist.some((item) => item._id === productData.product._id)
      );
    }
  }, [productData?.product?._id, wishlist]);

  // Track recently viewed + reset state when product changes
  useEffect(() => {
    if (productData?.product) {
      addToRecentlyViewed(productData.product);
      setSelectedVariants({});
      setQuantity(1);
      setActiveImage(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [productData?.product?._id]);

  const getVariantPriceAdjustment = () => {
    let adjustment = 0;
    const product = productData?.product;
    if (product?.variants) {
      for (const variant of product.variants) {
        const selectedValue = selectedVariants[variant.name];
        if (selectedValue) {
          const option = variant.options.find((o) => o.value === selectedValue);
          if (option) adjustment += option.priceAdjustment || 0;
        }
      }
    }
    return adjustment;
  };

  const handleAddToCart = () => {
    if (productData?.product?.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }
    const product = productData.product;
    const priceAdj = getVariantPriceAdjustment();
    const adjustedPrice = (product.finalPrice || product.basePrice) + priceAdj;

    dispatch(
      addItem({
        ...product,
        quantity,
        price: adjustedPrice,
        finalPrice: adjustedPrice,
        selectedVariants:
          Object.keys(selectedVariants).length > 0
            ? { ...selectedVariants }
            : undefined,
      })
    );
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const toggleWishlist = async () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(productData.product._id));
      if (user) removeFromApi(productData.product._id).catch(() => {});
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(productData.product));
      if (user) addToApi(productData.product._id).catch(() => {});
      toast.success("Added to wishlist");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !productData?.product) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-red-500">Product not found</p>
        <Link
          to="/products"
          className="text-blue-600 hover:underline text-sm"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const product = productData.product;
  const seller = product.seller;
  const images = product.images || [];

  const stock = Number(product.stock ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= (product.lowStockThreshold ?? 5);

  const basePrice = Number(product.basePrice ?? 0);
  const finalPrice =
    Number(product.finalPrice ?? basePrice) + getVariantPriceAdjustment();
  const discountPercentage = Math.round(product.discountPercentage || 0);
  const youSave = Math.max(0, basePrice - finalPrice);
  const freeShipping = finalPrice > FREE_SHIPPING_THRESHOLD;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-5 flex-wrap"
        >
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link
            to="/products"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Products
          </Link>
          {product.categories?.[0] && (
            <>
              <ChevronRight size={12} />
              <Link
                to={`/products?category=${product.categories[0]._id}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 capitalize"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Image gallery — 5 cols on desktop */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 lg:sticky lg:top-4">
              {/* Main image */}
              <div className="relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                {images[activeImage]?.imageUrl ? (
                  <img
                    src={images[activeImage].imageUrl}
                    alt={`${product.name} ${activeImage + 1}`}
                    className="max-h-full max-w-full object-contain transition-opacity duration-300"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No image</div>
                )}

                {/* Discount badge */}
                {discountPercentage > 0 && !isOutOfStock && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                    -{discountPercentage}%
                  </span>
                )}

                {/* Out of stock overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded font-semibold uppercase tracking-wider text-sm">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Wishlist toggle */}
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-label={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                  aria-pressed={isInWishlist}
                  className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                    isInWishlist
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-white/95 dark:bg-gray-800/95 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                  }`}
                >
                  <Heart
                    size={18}
                    className={isInWishlist ? "fill-current" : ""}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show image ${index + 1}`}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === index
                          ? "border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product info — 7 cols on desktop */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6">
              {product.brand && (
                <p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">
                  {product.brand}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Rating value={product.ratingsAverage || 0} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(product.ratingsAverage || 0).toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.numReviews || 0} review
                  {product.numReviews !== 1 ? "s" : ""}
                </span>
                {product.categories?.length > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.categories.slice(0, 2).map((c) => (
                        <span
                          key={c._id}
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  {discountPercentage > 0 && basePrice > finalPrice && (
                    <>
                      <span className="text-lg line-through text-gray-400 dark:text-gray-500">
                        ₹{basePrice.toFixed(2)}
                      </span>
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold px-2 py-0.5 rounded">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                {youSave > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                    You save ₹{youSave.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Stock status */}
              <div className="mt-4">
                {isOutOfStock ? (
                  <p className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Out of stock
                  </p>
                ) : isLowStock ? (
                  <p className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Hurry — only {stock} left in stock
                  </p>
                ) : (
                  <p className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    In stock — {stock} available
                  </p>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
                  {product.variants.map((variant) => (
                    <div key={variant.name}>
                      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        {variant.name}:{" "}
                        <span className="font-normal text-gray-500">
                          {selectedVariants[variant.name] || "Select an option"}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => {
                          const isSelected =
                            selectedVariants[variant.name] === option.value;
                          const oos = option.stock === 0;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [variant.name]: isSelected
                                    ? undefined
                                    : option.value,
                                }))
                              }
                              disabled={oos}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-200 dark:ring-blue-900"
                                  : "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                              } ${oos ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                            >
                              {option.value}
                              {option.priceAdjustment > 0 &&
                                ` (+₹${option.priceAdjustment})`}
                              {option.priceAdjustment < 0 &&
                                ` (-₹${Math.abs(option.priceAdjustment)})`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity + Actions */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.max(1, q - 1))
                      }
                      disabled={quantity <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(stock, q + 1))
                      }
                      disabled={quantity >= stock || isOutOfStock}
                      aria-label="Increase quantity"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TRUST_BADGES.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.label}
                      className="flex flex-col items-center text-center gap-2"
                    >
                      <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {b.label}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {b.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Free shipping callout */}
            {freeShipping && !isOutOfStock && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Free delivery on this item
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Order qualifies for our free-shipping threshold of ₹
                    {FREE_SHIPPING_THRESHOLD}.
                  </p>
                </div>
              </div>
            )}

            {/* Seller card */}
            {seller && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                      <Store size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sold by
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {seller.name}
                      </p>
                    </div>
                  </div>
                  {user && user._id !== seller._id && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await createConversation({
                            recipientId: seller._id,
                            productId: product._id,
                          }).unwrap();
                          navigate("/chat");
                        } catch {
                          toast.error("Failed to start chat");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <MessageCircle size={14} /> Chat with seller
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs: Description / Specifications / Reviews */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            {[
              { id: "description", label: "Description" },
              { id: "specifications", label: "Specifications" },
              { id: "reviews", label: `Reviews (${product.numReviews || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 md:px-6 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6">
            {activeTab === "description" && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {product.brand && (
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2">
                    <dt className="text-gray-500 dark:text-gray-400">Brand</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {product.brand}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2">
                  <dt className="text-gray-500 dark:text-gray-400">Stock</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {stock} units
                  </dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Tax Rate
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {product.taxPercentage || 0}%
                  </dd>
                </div>
                {product.categories?.length > 0 && (
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Category
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white capitalize">
                      {product.categories.map((c) => c.name).join(", ")}
                    </dd>
                  </div>
                )}
                {seller?.name && (
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Sold by
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {seller.name}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2">
                  <dt className="text-gray-500 dark:text-gray-400">SKU</dt>
                  <dd className="font-medium text-gray-900 dark:text-white font-mono text-xs">
                    {product._id?.slice(-8).toUpperCase()}
                  </dd>
                </div>
              </dl>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <ReviewForm productId={id} />
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <ReviewList productId={id} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedData?.products?.length > 0 && (
          <div className="mt-10">
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold">
                You may also like
              </h2>
              <Link
                to="/products"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedData.products.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
